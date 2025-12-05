"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { GitBranch, Database, Cpu, Network, Layers, Workflow } from "lucide-react";

const flowSteps = [
  {
    id: "input",
    icon: Network,
    title: "Input Processing",
    description: "사용자 음성/텍스트 입력 처리",
    tech: ["Deepgram STT", "WebSocket"],
  },
  {
    id: "router",
    icon: GitBranch,
    title: "Multi-LLM Router",
    description: "컨텍스트에 따른 최적 LLM 선택",
    tech: ["GPT-4o", "Claude 3.5", "Fallback Logic"],
  },
  {
    id: "rag",
    icon: Database,
    title: "Hybrid RAG",
    description: "직무/이력서 기반 맞춤형 질문 생성",
    tech: ["Vector DB", "BM25", "Re-ranking"],
  },
  {
    id: "agent",
    icon: Cpu,
    title: "LangGraph Agent",
    description: "면접관 페르소나 기반 대화 관리",
    tech: ["State Machine", "Memory", "Tools"],
  },
  {
    id: "structured",
    icon: Layers,
    title: "Structured Output",
    description: "표준화된 평가 데이터 생성",
    tech: ["JSON Schema", "Validation", "8-Axis Score"],
  },
  {
    id: "output",
    icon: Workflow,
    title: "Response Generation",
    description: "자연스러운 음성 응답 생성",
    tech: ["OpenAI TTS", "SSML", "Prosody"],
  },
];

export function FlowSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <section className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--mint)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--mint)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-soft-blue/20 text-soft-blue text-sm font-medium mb-6">
            Dynamic Interview Flow
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            지능형{" "}
            <span className="text-gradient-blue">Agent Architecture</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            LangGraph 기반의 동적 상태 관리로 실제 면접과 같은
            자연스러운 대화 흐름을 구현합니다.
          </p>
        </motion.div>

        {/* Flow Diagram */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
                className={`relative glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  activeStep === step.id
                    ? "ring-2 ring-soft-blue shadow-lg scale-[1.02]"
                    : ""
                }`}
              >
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-soft-blue text-navy font-bold text-sm flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-soft-blue/20 to-mint/20 flex items-center justify-center mb-5">
                  <step.icon className="w-7 h-7 text-soft-blue" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {step.description}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2">
                  {step.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 rounded-md bg-secondary/50 text-xs font-medium text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Connection Arrow */}
                {index < flowSteps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-soft-blue/50"
                    animate={
                      activeStep === step.id
                        ? { x: [0, 5, 0], opacity: 1 }
                        : { opacity: 0.5 }
                    }
                    transition={{ duration: 0.8, repeat: activeStep === step.id ? Infinity : 0 }}
                  >
                    →
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Architecture Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="glass-card rounded-3xl p-8 lg:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Hybrid RAG",
                  value: "Dense + Sparse",
                  desc: "Vector + BM25 검색으로 최적의 컨텍스트 제공",
                },
                {
                  title: "Multi-LLM",
                  value: "Adaptive Router",
                  desc: "질문 유형에 따른 최적 모델 자동 선택",
                },
                {
                  title: "Structured Output",
                  value: "JSON Schema",
                  desc: "일관된 평가 데이터 구조 보장",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-sm text-muted-foreground mb-2">{item.title}</p>
                  <p className="font-display text-2xl font-bold text-gradient-blue mb-2">
                    {item.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
