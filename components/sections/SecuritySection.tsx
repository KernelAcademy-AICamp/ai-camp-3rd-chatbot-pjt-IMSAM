"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, FileCheck, Globe, Server, Eye } from "lucide-react";

const securityFeatures = [
  {
    icon: Eye,
    title: "음성 비저장 정책",
    description: "실시간 처리 후 즉시 삭제, 서버에 음성 데이터 저장하지 않음",
    highlight: "Zero Storage",
  },
  {
    icon: Lock,
    title: "AES-256 암호화",
    description: "전송 및 처리 중 모든 데이터에 군사 수준 암호화 적용",
    highlight: "Military-Grade",
  },
  {
    icon: FileCheck,
    title: "GDPR 준수",
    description: "유럽 개인정보보호법 완벽 준수, 데이터 이동권 보장",
    highlight: "EU Compliant",
  },
  {
    icon: Globe,
    title: "한국 개인정보법",
    description: "개인정보보호법, 정보통신망법 등 국내 법규 완벽 준수",
    highlight: "PIPA Compliant",
  },
  {
    icon: Server,
    title: "격리된 처리 환경",
    description: "각 세션별 독립된 처리 환경으로 교차 오염 방지",
    highlight: "Isolated Env",
  },
  {
    icon: Shield,
    title: "정기 보안 감사",
    description: "분기별 외부 보안 감사 및 펜테스트 실시",
    highlight: "Quarterly Audit",
  },
];

export function SecuritySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="security" className="py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-navy/30 to-background" />

      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--mint)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--mint)/0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="container relative mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-mint/10 text-mint text-sm font-medium mb-6">
            Security & Compliance
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gradient-mint">개인정보 보호</span>를
            <br />
            최우선으로 생각합니다
          </h2>
          <p className="text-lg text-muted-foreground">
            음성 데이터는 실시간 처리 후 즉시 삭제됩니다.
            글로벌 보안 표준을 준수하여 안전하게 서비스를 제공합니다.
          </p>
        </motion.div>

        {/* Security Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover-lift group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center shrink-0 group-hover:bg-mint/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-mint" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {feature.description}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full bg-mint/10 text-mint text-xs font-medium">
                    {feature.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
