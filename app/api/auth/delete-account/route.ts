// ============================================
// Account Deletion API
// ============================================
// POST /api/auth/delete-account
// - Deletes user account and all associated data
// - Uses CASCADE to automatically delete all related data

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // Create Supabase client with cookies for auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Use service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Delete user from auth.users - CASCADE will handle all related data:
    // - profiles
    // - interview_sessions -> messages, interview_results
    // - user_keywords
    // - user_interview_summaries
    // - documents
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Account deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: '계정 삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Sign out the current session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '계정 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
