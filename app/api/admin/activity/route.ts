import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Admin 활동 로그 (면접 세션) API
 * Service Role Key로 RLS 우회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const offset = (page - 1) * limit;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 면접 세션 조회
    let query = supabase
      .from('interview_sessions')
      .select('*', { count: 'exact' });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: sessions, count, error } = await query;

    if (error) {
      console.error('Activity logs error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 유저 이메일 조회
    const userIds = [...new Set((sessions || []).map((s: { user_id: string }) => s.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    const emailMap = new Map<string, string>();
    (profilesData || []).forEach((p: { id: string; email: string }) => {
      emailMap.set(p.id, p.email);
    });

    const logs = (sessions || []).map((session: {
      id: string;
      user_id: string;
      job_type: string | null;
      industry: string | null;
      difficulty: string | null;
      status: string | null;
      turn_count: number | null;
      created_at: string;
      updated_at: string;
    }) => ({
      id: session.id,
      user_id: session.user_id,
      user_email: emailMap.get(session.user_id) || '알 수 없음',
      job_type: session.job_type || '미지정',
      industry: session.industry,
      difficulty: session.difficulty || 'medium',
      status: session.status || 'waiting',
      turn_count: session.turn_count || 0,
      created_at: session.created_at,
      completed_at: session.status === 'completed' ? session.updated_at : null,
    }));

    return NextResponse.json({
      data: logs,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Activity logs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
