"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  ArrowRight,
  Mic,
} from "lucide-react";

const stats = [
  {
    label: "총 면접 횟수",
    value: "12",
    suffix: "회",
    icon: Target,
    change: "+3",
    color: "mint",
  },
  {
    label: "평균 점수",
    value: "78.5",
    suffix: "점",
    icon: TrendingUp,
    change: "+12.3",
    color: "soft-blue",
  },
  {
    label: "총 연습 시간",
    value: "4.5",
    suffix: "시간",
    icon: Clock,
    change: "+1.2",
    color: "mint",
  },
  {
    label: "이번 주 면접",
    value: "3",
    suffix: "회",
    icon: Calendar,
    change: "+2",
    color: "soft-blue",
  },
];

const recentSessions = [
  {
    id: 1,
    date: "2024-01-15",
    position: "백엔드 개발자",
    score: 85,
    duration: "25분",
  },
  {
    id: 2,
    date: "2024-01-14",
    position: "프론트엔드 개발자",
    score: 78,
    duration: "22분",
  },
  {
    id: 3,
    date: "2024-01-12",
    position: "풀스택 개발자",
    score: 72,
    duration: "28분",
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            안녕하세요! 👋
          </h1>
          <p className="text-muted-foreground">
            오늘도 면접 연습으로 한 걸음 더 성장해보세요.
          </p>
        </div>
        <Link href="/interview">
          <Button variant="mint" size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            면접 시작하기
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}`} />
              </div>
              <span className={`text-sm font-medium text-${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-foreground">
                {stat.value}
              </span>
              <span className="text-muted-foreground">{stat.suffix}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-mint/5 to-soft-blue/5" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                빠른 시작
              </h2>
              <p className="text-muted-foreground mb-6">
                AI 면접관과 실전처럼 연습해보세요.
                실시간 음성 대화로 면접 역량을 향상시킬 수 있습니다.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link href="/interview">
                  <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-mint/50 transition-colors cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl bg-mint/10 flex items-center justify-center mb-4 group-hover:bg-mint/20 transition-colors">
                      <Mic className="w-7 h-7 text-mint" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      음성 면접
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      실시간 음성으로 진행
                    </p>
                  </div>
                </Link>
                <Link href="/interview?mode=text">
                  <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-soft-blue/50 transition-colors cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl bg-soft-blue/10 flex items-center justify-center mb-4 group-hover:bg-soft-blue/20 transition-colors">
                      <Target className="w-7 h-7 text-soft-blue" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">
                      텍스트 면접
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      채팅으로 편하게 연습
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                최근 면접
              </h2>
              <Link href="/dashboard/reports" className="text-sm text-mint hover:underline">
                전체 보기
              </Link>
            </div>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Link key={session.id} href={`/dashboard/${session.id}`}>
                  <div className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {session.position}
                      </span>
                      <span className="text-sm font-bold text-mint">
                        {session.score}점
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{session.date}</span>
                      <span>{session.duration}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
