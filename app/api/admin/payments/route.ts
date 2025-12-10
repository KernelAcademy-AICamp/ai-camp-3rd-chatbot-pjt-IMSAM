import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Admin 결제 (크레딧 트랜잭션) 내역 API
 * Service Role Key로 RLS 우회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // 크레딧 트랜잭션 조회
    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' });

    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data: transactions, count, error } = await query;

    if (error) {
      console.error('Payments API error:', error);
      // 테이블이 없으면 빈 결과 반환
      return NextResponse.json({
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      });
    }

    // 유저 정보 조회
    const userIds = [...new Set((transactions || []).map((t: { user_id: string }) => t.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds);

    const userMap = new Map<string, { email: string; full_name: string | null }>();
    (profilesData || []).forEach((p: { id: string; email: string; full_name: string | null }) => {
      userMap.set(p.id, { email: p.email, full_name: p.full_name });
    });

    const data = (transactions || []).map((tx: {
      id: string;
      user_id: string;
      amount: number;
      reason: string | null;
      balance_after: number | null;
      created_at: string;
    }) => {
      const user = userMap.get(tx.user_id);
      return {
        id: tx.id,
        user_id: tx.user_id,
        user_email: user?.email || '알 수 없음',
        user_name: user?.full_name || '이름 없음',
        amount: tx.amount,
        reason: tx.reason || '내역 없음',
        balance_after: tx.balance_after,
        created_at: tx.created_at,
      };
    });

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  }
}
