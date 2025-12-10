"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmotionIcon } from "@/components/emotion/EmotionIcon";
import { Sparkles } from "lucide-react";

/**
 * Interview Welcome Page
 * - Premium minimal design with Primary Color (Mint)
 * - EmotionIcon instead of traditional emoji
 * - Hero typography with weight contrast
 * - Soft gradient background
 */
export default function InterviewWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,55%,6%)] relative overflow-hidden">
      {/* Background Gradient Orb */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, hsl(var(--mint) / 0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--mint) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--mint) / 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl px-6">
        {/* Minimal Emotion Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="flex justify-center mb-8"
        >
          <EmotionIcon type="ready" size="xl" />
        </motion.div>

        {/* Hero Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-4">
            AI 면접을 시작할
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "var(--gradient-primary)",
              }}
            >
              준비가 되셨나요?
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed"
        >
          상위 1% 면접관의 시선으로
          <br className="hidden sm:block" />
          당신을 평가합니다
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => router.push("/interview/setup")}
            className="h-14 px-10 rounded-sm font-medium text-base
              bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--mint-dark))]
              hover:shadow-[var(--glow-mint)] transition-shadow duration-300
              text-slate-900"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            면접 시작하기
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="h-14 px-8 rounded-sm border-slate-700 hover:bg-slate-800/50"
          >
            대시보드로 돌아가기
          </Button>
        </motion.div>

        {/* Subtle Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 flex items-center justify-center gap-2 text-sm text-slate-500"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span>
            현재까지{" "}
            <span
              className="font-medium"
              style={{ color: "hsl(var(--mint))" }}
            >
              1,247
            </span>
            번의 면접이 진행되었어요
          </span>
        </motion.div>
      </div>
    </div>
  );
}
