import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Admin 대시보드 통계 API
 * Service Role Key로 RLS 우회
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 전체 유저 수
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 7일 내 가입자
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: newUsersLast7Days } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // 전체 면접 세션
    const { count: totalSessions } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true });

    // 오늘 면접
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todaySessions } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // 크레딧 통계
    const { data: creditData } = await supabase
      .from('credits')
      .select('current_credits, total_used');

    const credits = creditData || [];
    const totalCreditsRemaining = credits.reduce((acc: number, c: { current_credits: number }) => acc + (c.current_credits || 0), 0);
    const totalCreditsUsed = credits.reduce((acc: number, c: { total_used: number }) => acc + (c.total_used || 0), 0);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      newUsersLast7Days: newUsersLast7Days || 0,
      totalSessions: totalSessions || 0,
      todaySessions: todaySessions || 0,
      totalCreditsUsed,
      totalCreditsRemaining,
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
