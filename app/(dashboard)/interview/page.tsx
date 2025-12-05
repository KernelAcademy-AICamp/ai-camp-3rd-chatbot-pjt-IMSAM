"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  Volume2,
  VolumeX,
  User,
} from "lucide-react";

interface TranscriptionResponse {
  success: boolean;
  text: string;
  timestamp: string;
  error?: string;
}

interface InterviewResponse {
  success: boolean;
  response: string;
  interviewer: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  error?: string;
}

const interviewers = [
  { id: "tech-lead", name: "김기술", role: "실무팀장", emoji: "👨‍💼" },
  { id: "hr-manager", name: "박인사", role: "HR 담당자", emoji: "👩‍💻" },
  { id: "senior-peer", name: "이시니어", role: "시니어 동료", emoji: "👨‍🔬" },
];

interface Message {
  id: string;
  role: "user" | "interviewer";
  content: string;
  interviewer?: typeof interviewers[0];
  timestamp: Date;
}

export default function InterviewPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInterviewer, setCurrentInterviewer] = useState(interviewers[0]);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startRecording = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await processUserResponse(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      setError(err instanceof Error ? err.message : "마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // STT + LLM 처리
  const processUserResponse = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setError("");

      // 1. STT - 음성을 텍스트로 변환
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const sttResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const sttData: TranscriptionResponse = await sttResponse.json();

      if (!sttData.success) {
        setError(sttData.error || "음성 변환 실패");
        return;
      }

      // 사용자 메시지 추가
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: sttData.text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 2. LLM - 면접관 응답 생성
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        interviewerId: msg.interviewer?.id,
      }));

      const llmResponse = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: sttData.text,
          interviewerId: currentInterviewer.id,
          conversationHistory,
          position: "개발자",
        }),
      });

      const llmData: InterviewResponse = await llmResponse.json();

      if (!llmData.success) {
        setError(llmData.error || "면접관 응답 생성 실패");
        return;
      }

      // 면접관 응답 메시지 추가
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "interviewer",
        content: llmData.response,
        interviewer: currentInterviewer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 다음 면접관으로 순환 (가중치 기반)
      rotateInterviewer();

    } catch (err) {
      console.error("Processing error:", err);
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 면접관 순환 (가중치: 실무팀장 40%, HR 20%, 시니어 40%)
  const rotateInterviewer = () => {
    const random = Math.random();
    let nextInterviewer;

    // 같은 면접관이 연속으로 2번 이상 나오지 않도록
    const otherInterviewers = interviewers.filter(
      (i) => i.id !== currentInterviewer.id
    );

    if (random < 0.5) {
      // 50% 확률로 실무팀장 또는 시니어 (둘 다 40% 비중)
      nextInterviewer =
        otherInterviewers.find((i) => i.id === "tech-lead") ||
        otherInterviewers.find((i) => i.id === "senior-peer") ||
        otherInterviewers[0];
    } else if (random < 0.7) {
      // 20% 확률로 HR
      nextInterviewer =
        otherInterviewers.find((i) => i.id === "hr-manager") ||
        otherInterviewers[0];
    } else {
      // 30% 확률로 시니어 또는 실무팀장
      nextInterviewer =
        otherInterviewers.find((i) => i.id === "senior-peer") ||
        otherInterviewers.find((i) => i.id === "tech-lead") ||
        otherInterviewers[0];
    }

    setCurrentInterviewer(nextInterviewer);
  };

  const startInterview = async () => {
    setIsInterviewStarted(true);
    setIsProcessing(true);

    try {
      // 첫 질문을 LLM에서 생성
      const llmResponse = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: "[면접 시작] 지원자가 입장했습니다.",
          interviewerId: "tech-lead",
          conversationHistory: [],
          position: "개발자",
        }),
      });

      const llmData: InterviewResponse = await llmResponse.json();

      const welcomeMessage: Message = {
        id: "welcome",
        role: "interviewer",
        content: llmData.success
          ? llmData.response
          : "안녕하세요! 오늘 면접을 진행할 면접관들입니다. 간단한 자기소개부터 시작해볼까요?",
        interviewer: interviewers[0],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } catch {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "interviewer",
        content: "안녕하세요! 오늘 면접을 진행할 면접관들입니다. 간단한 자기소개부터 시작해볼까요?",
        interviewer: interviewers[0],
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = () => {
    setIsInterviewStarted(false);
    setMessages([]);
    // Navigate to results
    window.location.href = "/dashboard/1";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border/50">
        <div className="flex items-center gap-6">
          {interviewers.map((interviewer) => (
            <motion.div
              key={interviewer.id}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
                currentInterviewer.id === interviewer.id
                  ? "bg-mint/10 ring-2 ring-mint"
                  : "bg-secondary/30"
              }`}
            >
              <span className="text-2xl">{interviewer.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{interviewer.name}</p>
                <p className="text-xs text-muted-foreground">{interviewer.role}</p>
              </div>
              {currentInterviewer.id === interviewer.id && isProcessing && (
                <div className="voice-wave">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} style={{ height: `${8 + i * 4}px` }} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          {isInterviewStarted && (
            <Button variant="destructive" onClick={endInterview} className="gap-2">
              <Phone className="w-4 h-4" />
              면접 종료
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!isInterviewStarted ? (
          // Start Screen
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-lg"
            >
              <div className="flex justify-center gap-4 mb-8">
                {interviewers.map((interviewer, index) => (
                  <motion.div
                    key={interviewer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint/20 to-soft-blue/20 flex items-center justify-center text-4xl"
                  >
                    {interviewer.emoji}
                  </motion.div>
                ))}
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                AI 면접을 시작할 준비가 되셨나요?
              </h1>
              <p className="text-muted-foreground mb-8">
                3인의 AI 면접관이 실시간으로 질문합니다.
                <br />
                마이크를 허용하고 면접을 시작해주세요.
              </p>
              <Button variant="mint" size="xl" onClick={startInterview} className="gap-2">
                <Mic className="w-5 h-5" />
                면접 시작하기
              </Button>
            </motion.div>
          </div>
        ) : (
          // Interview Screen
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "interviewer" && message.interviewer && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint/20 to-soft-blue/20 flex items-center justify-center text-2xl shrink-0">
                      {message.interviewer.emoji}
                    </div>
                  )}
                  <div
                    className={`max-w-2xl p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-mint text-navy"
                        : "bg-secondary/50"
                    }`}
                  >
                    {message.role === "interviewer" && message.interviewer && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {message.interviewer.name} ({message.interviewer.role})
                      </p>
                    )}
                    <p className={message.role === "user" ? "text-navy" : "text-foreground"}>
                      {message.content}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-12 h-12 rounded-xl bg-mint/20 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-mint" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint/20 to-soft-blue/20 flex items-center justify-center text-2xl">
                    {currentInterviewer.emoji}
                  </div>
                  <div className="bg-secondary/50 px-6 py-4 rounded-2xl">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 bg-mint rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-8 mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                {error}
              </div>
            )}

            {/* Controls */}
            <div className="p-8 border-t border-border/50">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isRecording ? "destructive" : "mint"}
                  size="xl"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className="w-48 gap-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      녹음 중지
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      답변하기
                    </>
                  )}
                </Button>
              </div>
              {isRecording && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-mint mt-4"
                >
                  🔴 녹음 중... 말씀을 마치시면 버튼을 눌러주세요.
                </motion.p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
