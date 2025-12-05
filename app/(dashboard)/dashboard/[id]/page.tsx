"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Download,
  Share2,
  Lock,
  Unlock,
  TrendingUp,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// Mock data for the interview result
const mockData = {
  id: "1",
  date: "2024-01-15",
  position: "백엔드 개발자",
  company: "테크 스타트업",
  duration: "25분",
  overallScore: 85,
  isLocked: false,
  radarData: [
    { axis: "기술역량", score: 88 },
    { axis: "문제해결", score: 82 },
    { axis: "커뮤니케이션", score: 90 },
    { axis: "리더십", score: 75 },
    { axis: "창의성", score: 85 },
    { axis: "적응력", score: 80 },
    { axis: "협업능력", score: 88 },
    { axis: "전문성", score: 78 },
  ],
  interviewerFeedback: [
    {
      name: "김기술 (실무팀장)",
      score: 87,
      feedback: "기술적 이해도가 높고, 시스템 설계에 대한 논리적인 접근이 인상적입니다.",
    },
    {
      name: "박인사 (HR 담당자)",
      score: 85,
      feedback: "커뮤니케이션이 명확하고, 팀워크에 대한 가치관이 잘 드러났습니다.",
    },
    {
      name: "이시니어 (시니어 동료)",
      score: 83,
      feedback: "실무 경험을 바탕으로 한 답변이 구체적이었습니다. 디버깅 사례가 인상적이었습니다.",
    },
  ],
  improvements: [
    "STAR 기법을 활용한 답변 구조화 연습이 필요합니다.",
    "기술 트레이드오프 설명 시 더 구체적인 수치를 활용해보세요.",
    "답변 시간을 조금 더 간결하게 조절하면 좋겠습니다.",
  ],
};

export default function InterviewResultPage() {
  const params = useParams();
  const id = params.id;

  // In real app, fetch data based on id
  const data = mockData;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {data.position} 면접 결과
            </h1>
            <p className="text-muted-foreground">
              {data.date} · {data.duration}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            공유
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mint/10 text-mint text-sm font-medium mb-6">
              {data.isLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  잠김
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  공개
                </>
              )}
            </div>
            <div className="relative inline-block mb-6">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="12"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="hsl(var(--mint))"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(data.overallScore / 100) * 440} 440`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold text-foreground">
                  {data.overallScore}
                </span>
                <span className="text-sm text-muted-foreground">종합 점수</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-mint">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">상위 15%</span>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="glass-card rounded-3xl p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              8축 역량 분석
            </h2>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <Radar
                    name="역량"
                    dataKey="score"
                    stroke="hsl(var(--mint))"
                    fill="hsl(var(--mint))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interviewer Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-8"
      >
        <div className="glass-card rounded-3xl p-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">
            면접관별 피드백
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.interviewerFeedback.map((feedback, index) => (
              <div
                key={feedback.name}
                className="p-6 rounded-2xl bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-foreground">
                    {feedback.name}
                  </span>
                  <span className="text-lg font-bold text-mint">
                    {feedback.score}점
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feedback.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Improvements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="glass-card rounded-3xl p-8">
          <h2 className="font-display text-xl font-bold text-foreground mb-6">
            개선 포인트
          </h2>
          <div className="space-y-4">
            {data.improvements.map((improvement, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-soft-blue/5 border border-soft-blue/20"
              >
                <span className="w-6 h-6 rounded-full bg-soft-blue/20 flex items-center justify-center text-soft-blue text-sm font-medium shrink-0">
                  {index + 1}
                </span>
                <p className="text-foreground">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
