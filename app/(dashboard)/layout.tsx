"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Mic,
  BarChart3,
  Settings,
  LogOut,
  User,
  Loader2,
  History,
  Wallet,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const navItems = [
  { icon: LayoutDashboard, label: "대시보드", href: "/dashboard" },
  { icon: Mic, label: "면접 시작", href: "/interview" },
  { icon: History, label: "면접 기록", href: "/dashboard/history" },
  { icon: BarChart3, label: "분석 리포트", href: "/dashboard/reports" },
  { icon: Wallet, label: "크레딧", href: "/dashboard/credits" },
  { icon: Settings, label: "설정", href: "/dashboard/settings" },
];

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get singleton Supabase client
  const supabase = createBrowserSupabaseClient();

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        // 1. 먼저 캐시된 세션 확인 (빠름)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          // 즉시 기본 정보로 UI 업데이트
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name,
          });
        }

        // 2. 백그라운드에서 프로필 정보 가져오기 (3초 타임아웃)
        if (session?.user) {
          const profilePromise = supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
          });

          try {
            const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as { data: { full_name?: string } | null };

            if (isMounted && profile?.full_name) {
              setUser(prev => prev ? {
                ...prev,
                full_name: profile.full_name,
              } : null);
            }
          } catch (profileError) {
            // 프로필 로드 실패해도 무시 - 이미 기본 정보는 표시됨
            console.log('Profile fetch skipped:', profileError);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT") {
          setUser(null);
          window.location.href = "/login";
        } else if (session?.user) {
          // 즉시 기본 정보로 업데이트 (프로필 조회 없이)
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            full_name: session.user.user_metadata?.full_name,
          });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all storage
      sessionStorage.clear();
      localStorage.clear();

      // Clear all cookies (including Supabase auth cookies)
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      });

      // Force redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even on error, clear cookies and redirect
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[hsl(220,50%,8%)] border-r border-[hsl(220,40%,15%)] flex flex-col z-50">
        {/* Logo */}
        <div className="h-14 px-4 border-b border-[hsl(220,40%,15%)] flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/app-icon-dark.png"
              alt="IMSAM"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-display font-semibold text-lg text-foreground">
              IMSAM
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`relative flex items-center gap-3 px-3 py-2 mb-1 transition-colors ${
                    isActive
                      ? "bg-mint/10 text-mint"
                      : "text-muted-foreground hover:bg-[hsl(220,45%,10%)] hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 w-0.5 h-6 bg-mint" />
                  )}
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-[hsl(220,40%,15%)]">
          <div className="flex items-center gap-3 px-3 py-2 bg-[hsl(220,45%,10%)]">
            <div className="w-8 h-8 rounded-sm bg-mint/10 flex items-center justify-center">
              <User className="w-4 h-4 text-mint" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.full_name || "사용자"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || "로딩 중..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2 mt-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
