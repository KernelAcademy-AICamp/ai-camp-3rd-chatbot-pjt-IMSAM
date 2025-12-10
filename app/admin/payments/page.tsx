"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 확장된 CreditTransaction 타입 (유저 이름 포함)
interface CreditTransaction {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  reason: string;
  balance_after: number | null;
  created_at: string;
}

interface PaginatedResponse {
  data: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 이메일 마스킹 함수: user@example.com → us***@example.com
const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "알 수 없음";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length > 2 ? local.slice(0, 2) + "***" : local + "***";
  return `${masked}@${domain}`;
};

// 사유 한글 변환
const translateReason = (reason: string): string => {
  const translations: Record<string, string> = {
    // 면접 관련
    "INTERVIEW_START": "면접 시작",
    "INTERVIEW_COMPLETE": "면접 완료",
    "VOICE_ANALYSIS": "음성 분석",
    // 일일 보상
    "DAILY_LOGIN": "일일 로그인 보상",
    "DAILY_REWARD": "일일 보상",
    // 가입/결제
    "SIGNUP_BONUS": "가입 보너스",
    "PURCHASE": "크레딧 구매",
    // 플랜 업그레이드
    "PLAN_UPGRADE_BLOOM": "Bloom 플랜 업그레이드",
    "PLAN_UPGRADE_SPROUT": "Sprout 플랜 업그레이드",
    "PLAN_UPGRADE_SEED": "Seed 플랜 업그레이드",
    // 관리자
    "ADMIN_GRANT": "관리자 지급",
    "MANUAL_CREDIT": "수동 크레딧 지급",
    "관리자 지급": "관리자 지급",
    // 기타
    "AI_USE": "AI 사용",
    "API_USAGE": "API 사용",
    "REFUND": "환불",
    "PROMOTION": "프로모션",
    "Earned": "적립",
  };
  return translations[reason] || reason;
};

/**
 * 결제 (크레딧 트랜잭션) 내역 페이지
 */
export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<PaginatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<CreditTransaction | null>(null);

  const limit = 15;

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // API Route를 통해 결제 내역 조회 (RLS 우회)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/admin/payments?${params}`);
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">결제 내역</h1>
          <p className="text-slate-400">
            총 {transactions?.total || 0}건의 크레딧 트랜잭션
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="이메일로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-slate-800/50 border-slate-700"
            />
          </div>
          <Button type="submit" variant="outline" className="border-slate-700">
            검색
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">유저</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">금액</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">사유</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">잔액</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactions?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    거래 내역이 없습니다
                  </td>
                </tr>
              ) : (
                transactions?.data.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white">{tx.user_name}</p>
                        <p className="text-xs text-slate-500">{maskEmail(tx.user_email)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-sm font-medium ${
                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {tx.amount > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{translateReason(tx.reason)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{tx.balance_after ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(tx.created_at).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions && transactions.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
            <p className="text-sm text-slate-400">
              {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, transactions.total)} of {transactions.total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="border-slate-700">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage === transactions.totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="border-slate-700">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">거래 상세</h3>
                <button onClick={() => setSelectedTx(null)} className="p-2 hover:bg-slate-700 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedTx.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"
                  }`}>
                    <Coins className={`w-6 h-6 ${selectedTx.amount > 0 ? "text-green-400" : "text-red-400"}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${selectedTx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                      {selectedTx.amount > 0 ? "+" : ""}{selectedTx.amount} 크레딧
                    </p>
                    <p className="text-sm text-slate-400">{translateReason(selectedTx.reason)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 rounded-lg bg-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">유저</p>
                    <p className="text-sm font-medium text-white">{selectedTx.user_name}</p>
                    <p className="text-xs text-slate-500">{maskEmail(selectedTx.user_email)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">잔액</p>
                    <p className="text-sm font-medium text-white">{selectedTx.balance_after ?? "-"}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-700/30">
                  <p className="text-xs text-slate-400 mb-1">트랜잭션 ID</p>
                  <code className="text-xs text-mint break-all">{selectedTx.id}</code>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
