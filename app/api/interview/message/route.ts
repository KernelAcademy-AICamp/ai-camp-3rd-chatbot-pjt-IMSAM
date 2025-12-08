// ============================================
// Interview Message API
// ============================================
// POST /api/interview/message
// - Receives user answer
// - Generates interviewer response with LLM

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateInterviewerResponse, type ChatMessage } from '@/lib/llm/router';
import { ragService } from '@/lib/rag/service';
import { INTERVIEWERS, type InterviewerType } from '@/types/interview';

// Weighted interviewer selection
function selectNextInterviewer(currentId: InterviewerType): InterviewerType {
  const weights = {
    hiring_manager: 0.4,
    hr_manager: 0.2,
    senior_peer: 0.4,
  };

  const others = (Object.keys(weights) as InterviewerType[]).filter(id => id !== currentId);
  const totalWeight = others.reduce((sum, id) => sum + weights[id], 0);

  const random = Math.random() * totalWeight;
  let cumulative = 0;

  for (const id of others) {
    cumulative += weights[id];
    if (random <= cumulative) return id;
  }

  return others[0];
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('=== Interview Message API: Started ===');

  try {
    const body = await req.json();
    const { session_id, content, audio_url } = body;
    console.log('Request body:', { session_id, content: content?.substring(0, 50), audio_url });

    if (!session_id || !content) {
      console.error('Missing required fields:', { session_id, hasContent: !!content });
      return NextResponse.json(
        { success: false, error: '세션 ID와 메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookies for auth
    console.log('Creating Supabase client...');
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

    // Get session
    console.log('Fetching session:', session_id);
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      console.error('Session fetch error:', sessionError);
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('Session found:', { 
      id: session.id, 
      status: (session as { status: string }).status,
      turn_count: session.turn_count 
    });

    if ((session as { status: string }).status !== 'active') {
      console.error('Session not active:', (session as { status: string }).status);
      return NextResponse.json(
        { success: false, error: '면접이 진행 중이 아닙니다.' },
        { status: 400 }
      );
    }

    // Save user message
    console.log('Saving user message...');
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        session_id,
        role: 'user',
        content,
        audio_url,
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('User message save error:', userMsgError);
      throw new Error(`Failed to save user message: ${userMsgError.message}`);
    }
    console.log('User message saved:', userMessage?.id);

    // Get conversation history (excluding current message to avoid race condition)
    console.log('Fetching conversation history...');
    const { data: historyData, error: historyError } = await supabase
      .from('messages')
      .select('role, content, interviewer_id')
      .eq('session_id', session_id)
      .neq('id', userMessage?.id || '') // Exclude the just-saved message
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('History fetch error:', historyError);
      throw new Error(`Failed to fetch history: ${historyError.message}`);
    }

    // Build conversation history
    const conversationHistory: ChatMessage[] = (historyData || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    })) as ChatMessage[];

    // Add current user message explicitly
    conversationHistory.push({ role: 'user', content });

    console.log('Conversation history loaded:', conversationHistory.length, 'messages');

    // Select next interviewer
    const currentInterviewerId = session.current_interviewer_id as InterviewerType || 'hiring_manager';
    const nextInterviewerId = selectNextInterviewer(currentInterviewerId);
    const interviewer = INTERVIEWERS[nextInterviewerId];
    console.log('Interviewer selected:', { current: currentInterviewerId, next: nextInterviewerId });

    // Get relevant context from RAG
    let context = '';
    if (session.resume_doc_id) {
      console.log('Fetching RAG context for resume:', session.resume_doc_id);
      try {
        context = await ragService.getContextForInterview(
          session.user_id,
          content,
          session.resume_doc_id
        );
        console.log('RAG context retrieved:', context.length, 'chars');
      } catch (e) {
        console.warn('Failed to get RAG context:', e);
      }
    }

    // Generate interviewer response
    console.log('Generating LLM response...');
    const llmResponse = await generateInterviewerResponse(
      conversationHistory,
      nextInterviewerId,
      session.job_type,
      true // Use structured output
    );
    console.log('LLM response generated:', {
      contentLength: llmResponse.content.length,
      hasStructured: !!llmResponse.structuredResponse,
      latency: llmResponse.latencyMs
    });

    // Save interviewer message
    console.log('Saving interviewer message...');
    const { data: interviewerMessage, error: intMsgError } = await supabase
      .from('messages')
      .insert({
        session_id,
        role: 'interviewer',
        interviewer_id: nextInterviewerId,
        content: llmResponse.content,
        structured_response: llmResponse.structuredResponse,
        latency_ms: llmResponse.latencyMs,
      })
      .select()
      .single();

    if (intMsgError) {
      console.error('Interviewer message save error:', intMsgError);
      throw new Error(`Failed to save interviewer message: ${intMsgError.message}`);
    }
    console.log('Interviewer message saved:', interviewerMessage?.id);

    // Update session
    const newTurnCount = session.turn_count + 1;
    const shouldEnd = newTurnCount >= session.max_turns;
    console.log('Updating session:', { newTurnCount, shouldEnd });

    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        turn_count: newTurnCount,
        current_interviewer_id: nextInterviewerId,
        status: shouldEnd ? 'completed' : 'active',
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Session update error:', updateError);
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    console.log('=== Interview Message API: Success ===');
    console.log('Total latency:', Date.now() - startTime, 'ms');

    return NextResponse.json({
      success: true,
      user_message: {
        id: userMessage?.id || Date.now().toString(),
        session_id,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      },
      interviewer_response: {
        id: interviewerMessage?.id || (Date.now() + 1).toString(),
        session_id,
        role: 'interviewer',
        interviewer_id: nextInterviewerId,
        content: llmResponse.content,
        structured_response: llmResponse.structuredResponse,
        timestamp: new Date().toISOString(),
        latency_ms: llmResponse.latencyMs,
      },
      interviewer: {
        id: nextInterviewerId,
        name: interviewer.name,
        role: interviewer.role,
        emoji: interviewer.emoji,
      },
      session_status: shouldEnd ? 'completed' : 'active',
      turn_count: newTurnCount,
      should_end: shouldEnd,
      total_latency_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('=== Interview Message API: ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Total time before error:', Date.now() - startTime, 'ms');

    return NextResponse.json(
      {
        success: false,
        error: '메시지 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
