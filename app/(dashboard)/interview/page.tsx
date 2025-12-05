"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Phone,
  Volume2,
  VolumeX,
  MessageCircle,
  User,
} from "lucide-react";

interface TranscriptionResponse {
  success: boolean;
  text: string;
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
        await transcribeAudio(audioBlob);
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

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      setError("");

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data: TranscriptionResponse = await response.json();

      if (data.success) {
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Simulate AI response (in real app, this would call the LLM)
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "interviewer",
            content: getAIResponse(data.text),
            interviewer: currentInterviewer,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);

          // Rotate interviewer
          const currentIndex = interviewers.findIndex((i) => i.id === currentInterviewer.id);
          setCurrentInterviewer(interviewers[(currentIndex + 1) % interviewers.length]);
        }, 1500);
      } else {
        setError(data.error || "변환 실패");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getAIResponse = (userInput: string): string => {
    // Mock responses - in real app, this would use LLM
    const responses = [
      "좋은 답변이네요. 조금 더 구체적인 예시를 들어주시겠어요?",
      "그 경험에서 가장 어려웠던 점은 무엇이었나요?",
      "해당 기술을 선택한 이유와 트레이드오프에 대해 설명해주세요.",
      "팀원들과 협업할 때 갈등이 있었다면 어떻게 해결하셨나요?",
      "그 프로젝트의 성과를 수치로 표현할 수 있을까요?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const startInterview = () => {
    setIsInterviewStarted(true);
    const welcomeMessage: Message = {
      id: "welcome",
      role: "interviewer",
      content: "안녕하세요! 오늘 면접을 진행할 면접관들입니다. 간단한 자기소개부터 시작해볼까요?",
      interviewer: interviewers[0],
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
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
              {currentInterviewer.id === interviewer.id && (
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
