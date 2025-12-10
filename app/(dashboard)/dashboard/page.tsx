"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Play,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  ArrowRight,
  Mic,
  FileText,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { JOB_TYPES } from "@/types/interview";

// 5축 핵심 역량 라벨
const CATEGORY_LABELS: Record<string, string> = {
  logical_structure: "논리적 구조",
  job_expertise: "직무 전문성",
  attitude_communication: "태도/커뮤니케이션",
  company_fit: "회사 적합도",
  growth_potential: "성장 가능성",
};

interface CategoryScore {
  score: number;
  reasoning: string;
}

interface InterviewSession {
  id: string;
  job_type: string;
  difficulty: string;
  status: string;
  turn_count: number;
  created_at: string;
}

interface InterviewResult {
  id: string;
  session_id: string;
  overall_score: number;
  pass_status: string;
  category_scores?: {
    logical_structure: CategoryScore;
    job_expertise: CategoryScore;
    attitude_communication: CategoryScore;
    company_fit: CategoryScore;
    growth_potential: CategoryScore;
  };
  created_at: string;
  interview_sessions?: InterviewSession;
}

interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  totalMinutes: number;
  thisWeekCount: number;
  scoreChange: number;
  interviewChange: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    averageScore: 0,
    totalMinutes: 0,
    thisWeekCount: 0,
    scoreChange: 0,
    interviewChange: 0,
  });
  const [recentResults, setRecentResults] = useState<InterviewResult[]>([]);
  const [scoreHistory, setScoreHistory] = useState<
    { date: string; score: number }[]
  >([]);
  const [avgCompetency, setAvgCompetency] = useState<
    { subject: string; score: number }[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // 5초 타임아웃으로 빠른 실패 처리
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      try {
        await Promise.race([fetchDashboardData(), timeoutPromise]);
      } catch (error) {
        console.error('Dashboard data load error:', error);
        if (isMounted) {
          setDemoData();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();

      // 캐시된 세션 사용 (getUser보다 빠름)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        // Use demo data if not logged in
        setDemoData();
        return;
      }

      const user = session.user;

      // Fetch interview results with sessions
      const { data: results } = await supabase
        .from("interview_results")
        .select(
          `
          *,
          interview_sessions (*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!results || results.length === 0) {
        setDemoData();
        return;
      }

      // Cast results to proper type
      const typedResults = results as unknown as InterviewResult[];

      // Calculate stats
      const totalInterviews = typedResults.length;
      const averageScore =
        typedResults.reduce((sum, r) => sum + r.overall_score, 0) / totalInterviews;

      // Calculate this week count
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekCount = typedResults.filter(
        (r) => new Date(r.created_at) >= oneWeekAgo
      ).length;

      // Calculate total minutes (estimate based on turn count)
      const totalMinutes = typedResults.reduce((sum, r) => {
        const turns = r.interview_sessions?.turn_count || 5;
        return sum + turns * 2; // ~2 minutes per turn
      }, 0);

      // Score history for chart
      const history = typedResults
        .slice(0, 7)
        .reverse()
        .map((r) => ({
          date: new Date(r.created_at).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          }),
          score: r.overall_score,
        }));

      // Average category scores (5-axis)
      const categoryTotals: Record<string, number> = {};
      const categoryKeys = Object.keys(CATEGORY_LABELS);

      categoryKeys.forEach((key) => {
        categoryTotals[key] = 0;
      });

      let resultsWithScores = 0;
      typedResults.forEach((r) => {
        if (r.category_scores) {
          resultsWithScores++;
          categoryKeys.forEach((key) => {
            const score = r.category_scores?.[key as keyof typeof r.category_scores]?.score || 0;
            // Convert 1-5 scale to percentage
            categoryTotals[key] += Math.round(((score - 1) / 4) * 100);
          });
        }
      });

      const avgCompetencyData = categoryKeys.map((key) => ({
        subject: CATEGORY_LABELS[key],
        score: resultsWithScores > 0 ? Math.round(categoryTotals[key] / resultsWithScores) : 0,
      }));

      setStats({
        totalInterviews,
        averageScore: Math.round(averageScore * 10) / 10,
        totalMinutes,
        thisWeekCount,
        scoreChange: typedResults.length >= 2 ? typedResults[0].overall_score - typedResults[1].overall_score : 0,
        interviewChange: thisWeekCount,
      });
      setRecentResults(typedResults.slice(0, 5));
      setScoreHistory(history);
      setAvgCompetency(avgCompetencyData);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    // Demo data for users without interview history
    setStats({
      totalInterviews: 0,
      averageScore: 0,
      totalMinutes: 0,
      thisWeekCount: 0,
      scoreChange: 0,
      interviewChange: 0,
    });
    setRecentResults([]);
    setScoreHistory([]);
    setAvgCompetency([
      { subject: "논리적 구조", score: 0 },
      { subject: "직무 전문성", score: 0 },
      { subject: "태도/커뮤니케이션", score: 0 },
      { subject: "회사 적합도", score: 0 },
      { subject: "성장 가능성", score: 0 },
    ]);
    setIsLoading(false);
  };

  const getJobLabel = (value: string) => {
    return JOB_TYPES.find((j) => j.value === value)?.label || value;
  };

  const getPassStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
            합격
          </span>
        );
      case "borderline":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
            보류
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
            불합격
          </span>
        );
    }
  };

  const statsConfig = [
    {
      label: "총 면접 횟수",
      value: stats.totalInterviews,
      suffix: "회",
      icon: Target,
      change: `+${stats.interviewChange}`,
      color: "mint",
    },
    {
      label: "평균 점수",
      value: stats.averageScore,
      suffix: "점",
      icon: TrendingUp,
      change: stats.scoreChange >= 0 ? `+${stats.scoreChange}` : `${stats.scoreChange}`,
      color: "soft-blue",
    },
    {
      label: "총 연습 시간",
      value: Math.round(stats.totalMinutes / 60 * 10) / 10,
      suffix: "시간",
      icon: Clock,
      change: "",
      color: "mint",
    },
    {
      label: "이번 주 면접",
      value: stats.thisWeekCount,
      suffix: "회",
      icon: Calendar,
      change: "",
      color: "soft-blue",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mint" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">
            대시보드
          </h1>
          <p className="text-sm text-muted-foreground">
            면접 연습 현황
          </p>
        </div>
        <Link href="/interview/welcome">
          <Button variant="mint" className="h-9 px-4 gap-2 rounded-sm">
            <Play className="w-4 h-4" />
            면접 시작
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="p-4 bg-[hsl(220,50%,8%)] shadow-[0_1px_3px_rgba(0,0,0,0.3)] border-none">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-sm ${
                    stat.color === "mint" ? "bg-mint/10" : "bg-soft-blue/10"
                  } flex items-center justify-center`}
                >
                  <stat.icon
                    className={`w-5 h-5 ${
                      stat.color === "mint" ? "text-mint" : "text-soft-blue"
                    }`}
                  />
                </div>
                {stat.change && (
                  <span
                    className={`text-xs font-semibold ${
                      stat.color === "mint" ? "text-mint" : "text-soft-blue"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">{stat.suffix}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Score Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="p-4 bg-[hsl(220,50%,8%)] shadow-[0_2px_8px_rgba(0,0,0,0.4)] border-none">
            <h2 className="text-lg font-semibold mb-4">
              점수 추이
            </h2>
            {scoreHistory.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,40%,15%)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(220,40%,15%)" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "hsl(220,15%,55%)", fontSize: 11 }}
                      axisLine={{ stroke: "hsl(220,40%,15%)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220,50%,8%)",
                        border: "1px solid hsl(220,40%,15%)",
                        borderRadius: "2px",
                      }}
                      labelStyle={{ color: "hsl(220,20%,95%)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#00D9A5"
                      strokeWidth={2}
                      dot={{ fill: "#00D9A5", r: 3 }}
                      activeDot={{ r: 5, fill: "#00D9A5" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                면접 기록이 없습니다
              </div>
            )}
          </Card>
        </motion.div>

        {/* Competency Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card className="p-4 bg-[hsl(220,50%,8%)] shadow-[0_2px_8px_rgba(0,0,0,0.4)] border-none">
            <h2 className="text-lg font-semibold mb-4">
              평균 역량 분석
            </h2>
            {stats.totalInterviews > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={avgCompetency}>
                    <PolarGrid stroke="hsl(220,40%,15%)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "hsl(220,15%,55%)", fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "hsl(220,15%,45%)", fontSize: 9 }}
                    />
                    <Radar
                      name="평균 점수"
                      dataKey="score"
                      stroke="#00D9A5"
                      fill="#00D9A5"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                역량 분석 데이터가 없습니다
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="col-span-3"
        >
          <Card className="p-6 bg-[hsl(220,50%,8%)] shadow-[0_1px_3px_rgba(0,0,0,0.3)] border-none relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-mint/5 to-soft-blue/5" />
            <div className="relative">
              <h2 className="text-xl font-semibold mb-3">
                빠른 시작
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                AI 면접관과 실전처럼 연습해보세요
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/interview/setup">
                  <div className="p-4 bg-card/50 border border-border/40 hover:border-mint/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-sm bg-mint/10 flex items-center justify-center mb-3 group-hover:bg-mint/20 transition-colors">
                      <Mic className="w-6 h-6 text-mint" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      AI 모의면접
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      3명의 면접관과 실전 연습
                    </p>
                  </div>
                </Link>
                <Link href="/interview/setup">
                  <div className="p-4 bg-card/50 border border-border/40 hover:border-soft-blue/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-sm bg-soft-blue/10 flex items-center justify-center mb-3 group-hover:bg-soft-blue/20 transition-colors">
                      <FileText className="w-6 h-6 text-soft-blue" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">
                      이력서 기반 면접
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      이력서 분석 맞춤 질문
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card className="p-4 h-full bg-[hsl(220,50%,8%)] shadow-[0_1px_3px_rgba(0,0,0,0.3)] border-none">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                최근 면접
              </h2>
              {recentResults.length > 0 && (
                <Link
                  href="/dashboard/history"
                  className="text-xs text-mint hover:underline flex items-center gap-1"
                >
                  전체 보기
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            {recentResults.length > 0 ? (
              <div className="space-y-2">
                {recentResults.map((result) => (
                  <Link key={result.id} href={`/dashboard/${result.session_id}`}>
                    <div className="p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                          {getJobLabel(
                            result.interview_sessions?.job_type || ""
                          )}
                        </span>
                        <span className="text-xs font-bold text-mint">
                          {result.overall_score}점
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.created_at).toLocaleDateString(
                            "ko-KR"
                          )}
                        </span>
                        {getPassStatusBadge(result.pass_status)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Target className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-xs mb-3">
                  아직 면접 기록이 없습니다
                </p>
                <Link href="/interview/setup">
                  <Button variant="outline" className="h-8 px-3 text-xs gap-2 rounded-sm">
                    첫 면접 시작하기
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
