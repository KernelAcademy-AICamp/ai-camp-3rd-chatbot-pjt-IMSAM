"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MessageCircle, Target, Heart, Lightbulb } from "lucide-react";

const interviewers = [
  {
    id: "tech-lead",
    emoji: "👨‍💼",
    name: "김도현",
    role: "실무팀장",
    title: "Technical Lead",
    personality: "분석적이고 체계적인 질문 스타일",
    focus: ["기술적 역량", "문제 해결력", "시스템 설계"],
    color: "mint",
    sampleQuestion: "해당 기술을 선택한 이유와 트레이드오프는 무엇인가요?",
    evaluation: ["기술 깊이", "논리적 사고", "아키텍처 이해"],
  },
  {
    id: "hr-manager",
    emoji: "👩‍💻",
    name: "박서연",
    role: "HR 담당자",
    title: "HR Manager",
    personality: "따뜻하고 공감적인 질문 스타일",
    focus: ["조직 적합성", "커뮤니케이션", "성장 가능성"],
    color: "soft-blue",
    sampleQuestion: "팀 내 갈등 상황을 어떻게 해결하셨나요?",
    evaluation: ["문화 적합성", "협업 능력", "성장 마인드셋"],
  },
  {
    id: "senior-peer",
    emoji: "👨‍🔬",
    name: "이준혁",
    role: "시니어 동료",
    title: "Senior Peer",
    personality: "실무 중심의 날카로운 질문 스타일",
    focus: ["실무 경험", "협업 스타일", "일하는 방식"],
    color: "mint",
    sampleQuestion: "가장 어려웠던 디버깅 경험과 해결 과정을 말해주세요.",
    evaluation: ["실무 역량", "문제 해결", "코드 품질"],
  },
];

export function InterviewersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeInterviewer, setActiveInterviewer] = useState<string | null>(null);

  return (
    <section id="interviewers" className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container relative mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-mint/10 text-mint text-sm font-medium mb-6">
            Three AI Interviewers
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            3인의{" "}
            <span className="text-gradient-mint">전문 AI 면접관</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            각기 다른 관점과 전문성을 가진 AI 면접관이
            다각도로 역량을 평가합니다.
          </p>
        </motion.div>

        {/* Interviewers Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {interviewers.map((interviewer, index) => (
            <motion.div
              key={interviewer.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              onMouseEnter={() => setActiveInterviewer(interviewer.id)}
              onMouseLeave={() => setActiveInterviewer(null)}
              className={`relative glass-card rounded-3xl p-8 cursor-pointer transition-all duration-500 ${
                activeInterviewer === interviewer.id
                  ? "ring-2 ring-mint shadow-mint scale-[1.02]"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Avatar Section */}
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-mint/20 to-soft-blue/20 flex items-center justify-center text-4xl">
                    {interviewer.emoji}
                  </div>
                  {/* Voice Indicator */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-mint flex items-center justify-center"
                    animate={
                      activeInterviewer === interviewer.id
                        ? { scale: [1, 1.2, 1] }
                        : {}
                    }
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <div className="voice-wave" style={{ height: "16px" }}>
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className="!bg-navy"
                          style={{ width: "2px", height: `${4 + i * 3}px` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {interviewer.name}
                  </h3>
                  <p className="text-mint font-medium">{interviewer.role}</p>
                  <p className="text-sm text-muted-foreground">{interviewer.title}</p>
                </div>
              </div>

              {/* Personality */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-soft-blue" />
                  <span className="text-sm font-medium text-foreground">성격</span>
                </div>
                <p className="text-sm text-muted-foreground">{interviewer.personality}</p>
              </div>

              {/* Focus Areas */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-mint" />
                  <span className="text-sm font-medium text-foreground">평가 포커스</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interviewer.focus.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs font-medium text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Question */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: activeInterviewer === interviewer.id ? 1 : 0.7,
                  height: "auto",
                }}
                className="relative"
              >
                <div className="flex items-start gap-3 p-4 rounded-xl bg-mint/5 border border-mint/20">
                  <MessageCircle className="w-5 h-5 text-mint shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-medium text-mint block mb-1">
                      예시 질문
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">
                      "{interviewer.sampleQuestion}"
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Evaluation Metrics */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-foreground">평가 항목</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {interviewer.evaluation.map((metric) => (
                    <div
                      key={metric}
                      className="text-center p-2 rounded-lg bg-secondary/30"
                    >
                      <span className="text-xs text-muted-foreground">{metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Collaboration Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                협력적 면접 프로세스
              </h3>
              <p className="text-muted-foreground">
                3인의 면접관이 상호 보완적으로 질문하며 종합적인 역량을 평가합니다
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

              {[
                { interviewer: "실무팀장", action: "기술적 배경 질문", time: "00:00" },
                { interviewer: "HR 담당자", action: "동기 및 가치관 탐색", time: "05:00" },
                { interviewer: "시니어 동료", action: "실무 경험 심층 질문", time: "10:00" },
                { interviewer: "전원", action: "종합 평가 및 피드백", time: "20:00" },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1 + index * 0.15 }}
                  className={`relative flex items-center gap-4 mb-6 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <span className="text-xs text-mint font-medium">{step.time}</span>
                    <p className="font-medium text-foreground">{step.action}</p>
                    <p className="text-sm text-muted-foreground">{step.interviewer}</p>
                  </div>
                  <div className="relative z-10 w-4 h-4 rounded-full bg-mint shadow-mint" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
