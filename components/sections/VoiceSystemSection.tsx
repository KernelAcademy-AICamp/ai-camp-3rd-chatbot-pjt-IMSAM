"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mic, Brain, Volume2, ArrowRight, Zap } from "lucide-react";

const pipelineSteps = [
  {
    icon: Mic,
    title: "STT",
    subtitle: "Speech-to-Text",
    tech: "Deepgram Nova-2",
    description: "실시간 음성 인식으로 사용자 발화를 텍스트로 변환",
    latency: "~300ms",
    color: "mint",
  },
  {
    icon: Brain,
    title: "LLM",
    subtitle: "Language Model",
    tech: "GPT-4o / Claude 3.5",
    description: "컨텍스트 기반 지능형 질문 생성 및 답변 분석",
    latency: "~1000ms",
    color: "soft-blue",
  },
  {
    icon: Volume2,
    title: "TTS",
    subtitle: "Text-to-Speech",
    tech: "OpenAI TTS",
    description: "자연스러운 음성 합성으로 면접관 발화 생성",
    latency: "~400ms",
    color: "mint",
  },
];

const techLogos = [
  { name: "Deepgram", role: "STT Engine" },
  { name: "GPT-4o", role: "Primary LLM" },
  { name: "Claude", role: "Fallback LLM" },
  { name: "OpenAI TTS", role: "Voice Synthesis" },
];

export function VoiceSystemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="technology" className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-mint/5 blur-[150px]" />
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
            Real-time Voice System
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-mint">2초 미만</span>의
            <br />
            실시간 음성 인터랙션
          </h2>
          <p className="text-lg text-muted-foreground">
            최첨단 AI 파이프라인으로 실제 대화와 같은 자연스러운 면접 경험을 제공합니다.
          </p>
        </motion.div>

        {/* Pipeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-5xl mx-auto mb-20"
        >
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-mint via-soft-blue to-mint rounded-full -translate-y-1/2 z-0" />

          {/* Animated Pulse */}
          <motion.div
            className="hidden lg:block absolute top-1/2 h-1 w-20 bg-mint rounded-full -translate-y-1/2 z-10 shadow-[0_0_20px_hsl(var(--mint))]"
            animate={{
              left: ["0%", "100%"],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="grid lg:grid-cols-3 gap-8 relative z-20">
            {pipelineSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                onMouseEnter={() => setActiveStep(index)}
                className={`glass-card rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                  activeStep === index ? "ring-2 ring-mint shadow-mint" : ""
                }`}
              >
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center text-mint font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-mint/10 text-mint text-xs font-medium">
                    {step.latency}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint/20 to-soft-blue/20 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-mint" />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{step.subtitle}</p>

                <div className="px-3 py-2 rounded-lg bg-secondary/50 inline-block mb-4">
                  <span className="text-sm font-medium text-foreground">{step.tech}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for non-last items */}
                {index < pipelineSteps.length - 1 && (
                  <div className="hidden lg:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30">
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center"
                    >
                      <ArrowRight className="w-5 h-5 text-mint" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Total Latency Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-2xl mx-auto mb-20"
        >
          <div className="relative glass-card rounded-2xl p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-mint/5 via-soft-blue/5 to-mint/5" />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-mint" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total End-to-End Latency
                </span>
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="font-display text-6xl font-bold text-gradient-mint">
                  &lt;2
                </span>
                <span className="text-2xl font-semibold text-foreground">초</span>
              </div>
              <p className="text-muted-foreground mt-3">
                실제 대화와 같은 자연스러운 턴테이킹 경험
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">
            Powered by Industry-Leading AI
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {techLogos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.1 }}
                className="glass px-6 py-4 rounded-xl flex flex-col items-center gap-1 hover-lift"
              >
                <span className="font-semibold text-foreground">{logo.name}</span>
                <span className="text-xs text-muted-foreground">{logo.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
