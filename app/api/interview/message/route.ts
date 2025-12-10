// ============================================
// Interview Message API
// ============================================
// POST /api/interview/message
// - Receives user answer
// - Generates interviewer response with LLM
// - Enhanced interviewer transition logic

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import * as Sentry from '@sentry/nextjs';
import { generateInterviewerResponse, extractInterviewKeywords, type ChatMessage, type UserKeyword } from '@/lib/llm/router';
import { ragService } from '@/lib/rag/service';
import { searchRelevantQuestions } from '@/lib/rag/question-service';
import { INTERVIEWER_BASE, type InterviewerType, type MBTIType, type JobCategory, type InterviewQuestionSearchResult, type StructuredResponse } from '@/types/interview';

// Maximum follow-up questions allowed when checking last 3 messages
// If 전전 and 전전전 are both follow-ups, force new question
const MAX_CONSECUTIVE_FOLLOW_UPS_IN_HISTORY = 2;

/**
 * Check if a new question should be forced based on consecutive follow-ups
 * Returns true only if there have been 2 consecutive follow-ups (전 and 전전)
 * Follow-ups are ENCOURAGED by default, new question only after 2 consecutive
 */
function shouldForceNewQuestion(recentInterviewerMessages: Array<{ structured_response?: StructuredResponse | null }>): boolean {
  // Need at least 2 previous interviewer messages to check
  if (recentInterviewerMessages.length < 2) {
    return false; // Encourage follow-up
  }

  // Check the most recent messages (전, 전전)
  // Index 0 is most recent (전), index 1 is 전전
  const prev = recentInterviewerMessages[0]?.structured_response; // 전 (most recent)
  const prevPrev = recentInterviewerMessages[1]?.structured_response; // 전전

  // Check if both are follow-ups
  const prevIsFollowUp = prev?.follow_up_intent === true;
  const prevPrevIsFollowUp = prevPrev?.follow_up_intent === true;

  // Force new question only if there have been 2 consecutive follow-ups
  if (prevIsFollowUp && prevPrevIsFollowUp) {
    console.log('[Follow-up Check] 2 consecutive follow-ups detected - forcing new question');
    return true;
  }

  return false; // Otherwise, encourage follow-up
}

/**
 * Enhanced interviewer selection with follow-up probability
 * If same interviewer selected, high chance of follow-up question
 * If different interviewer, transform question or ask new one
 */
function selectNextInterviewer(
  currentId: InterviewerType,
  turnCount: number,
  followUpProhibited: boolean = false
): { nextId: InterviewerType; isFollowUp: boolean; shouldForceNewTopic: boolean } {
  // Base weights for each interviewer
  const baseWeights = {
    hiring_manager: 0.4,
    hr_manager: 0.2,
    senior_peer: 0.4,
  };

  // Force new topic if follow-up is prohibited by history analysis
  if (followUpProhibited) {
    console.log('[Interviewer Selection] Follow-up prohibited by history - forcing new topic');
    // Must switch interviewer and start new topic
    const others = (Object.keys(baseWeights) as InterviewerType[]).filter(id => id !== currentId);
    const totalWeight = others.reduce((sum, id) => sum + baseWeights[id], 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const id of others) {
      cumulative += baseWeights[id];
      if (random <= cumulative) {
        return { nextId: id, isFollowUp: false, shouldForceNewTopic: true };
      }
    }
    return { nextId: others[0], isFollowUp: false, shouldForceNewTopic: true };
  }

  // Follow-up probability: same interviewer continues (higher early in interview)
  const followUpProbability = Math.max(0.3, 0.6 - (turnCount * 0.05)); // Starts at 55%, decreases

  // Decide if same interviewer should continue for follow-up
  if (Math.random() < followUpProbability) {
    return { nextId: currentId, isFollowUp: true, shouldForceNewTopic: false };
  }

  // Select different interviewer
  const others = (Object.keys(baseWeights) as InterviewerType[]).filter(id => id !== currentId);
  const totalWeight = others.reduce((sum, id) => sum + baseWeights[id], 0);

  const random = Math.random() * totalWeight;
  let cumulative = 0;

  for (const id of others) {
    cumulative += baseWeights[id];
    if (random <= cumulative) {
      return { nextId: id, isFollowUp: false, shouldForceNewTopic: false };
    }
  }

  return { nextId: others[0], isFollowUp: false, shouldForceNewTopic: false };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('=== Interview Message API: Started ===');

  try {
    const body = await req.json();
    const { session_id, content, audio_url, timeout_save_only } = body;
    console.log('Request body:', { session_id, content: content?.substring(0, 50), audio_url, timeout_save_only });

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

    // If timeout_save_only flag is set, just save the user message and return
    // This is used when the 5-minute timer runs out during recording
    if (timeout_save_only) {
      console.log('[Timeout] Save only mode - skipping interviewer response');
      return NextResponse.json({
        success: true,
        timeout_save_only: true,
        user_message: {
          id: userMessage?.id || Date.now().toString(),
          session_id,
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        },
        message: '타임아웃으로 인해 사용자 메시지만 저장되었습니다.',
      });
    }

    // Get conversation history (excluding current message to avoid race condition)
    console.log('Fetching conversation history...');
    const { data: historyData, error: historyError } = await supabase
      .from('messages')
      .select('role, content, interviewer_id, structured_response')
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

    // ============================================
    // Extract keywords after first user response (자기소개)
    // ============================================
    if (session.turn_count === 0) {
      console.log('[Keyword Extraction] First user response - extracting keywords from self-introduction');
      try {
        const extractedKeywords = await extractInterviewKeywords(
          [{ role: 'user', content }],
          session.job_type
        );

        if (extractedKeywords.keywords && extractedKeywords.keywords.length > 0) {
          console.log(`[Keyword Extraction] Extracted ${extractedKeywords.keywords.length} keywords`);

          // Save keywords to user_keywords table (upsert)
          for (const kw of extractedKeywords.keywords) {
            const { error: kwError } = await supabase
              .from('user_keywords')
              .upsert({
                user_id: session.user_id,
                keyword: kw.keyword,
                category: kw.category,
                context: kw.context || null,
                mentioned_count: kw.mentioned_count || 1,
              }, {
                onConflict: 'user_id,keyword',
                ignoreDuplicates: false,
              });

            if (kwError) {
              console.warn(`[Keyword Extraction] Failed to save keyword "${kw.keyword}":`, kwError);
            }
          }
          console.log('[Keyword Extraction] Keywords saved to DB');
        }
      } catch (e) {
        console.warn('[Keyword Extraction] Failed:', e);
        // Don't fail the request if keyword extraction fails
      }
    }

    // ============================================
    // Analyze recent interviewer messages for follow-up pattern
    // Follow-ups are ENCOURAGED, but force new question after 2 consecutive
    // ============================================
    const recentInterviewerMessages = (historyData || [])
      .filter((msg: { role: string }) => msg.role === 'interviewer')
      .slice(-3) // Last 3 interviewer messages
      .reverse() as Array<{ structured_response?: StructuredResponse | null }>; // Most recent first

    const forceNewQuestionFlag = shouldForceNewQuestion(recentInterviewerMessages);
    console.log('[Follow-up Check] Recent interviewer messages:', recentInterviewerMessages.length);
    console.log('[Follow-up Check] Force new question:', forceNewQuestionFlag);

    // Select next interviewer with enhanced follow-up logic
    const currentInterviewerId = session.current_interviewer_id as InterviewerType || 'hiring_manager';

    // Track session metadata
    interface SessionMetadataExtended {
      interviewer_mbti?: Record<InterviewerType, MBTIType>;
      interviewer_names?: Record<InterviewerType, string>;
    }
    const sessionMeta = (session.timer_config as unknown as SessionMetadataExtended) || {};

    const { nextId: nextInterviewerId, isFollowUp, shouldForceNewTopic } = selectNextInterviewer(
      currentInterviewerId,
      session.turn_count,
      forceNewQuestionFlag // Pass flag when 2+ consecutive follow-ups detected
    );
    const interviewerBase = INTERVIEWER_BASE[nextInterviewerId];

    // Get interviewer MBTI and name from session metadata
    interface SessionMetadata {
      interviewer_mbti?: Record<InterviewerType, MBTIType>;
      interviewer_names?: Record<InterviewerType, string>;
      jd_text?: string;
    }
    const sessionMetadata = (session.timer_config as unknown as SessionMetadata) || {};
    const interviewerMbti = sessionMetadata.interviewer_mbti?.[nextInterviewerId] as MBTIType | undefined;
    const interviewerName = sessionMetadata.interviewer_names?.[nextInterviewerId] || interviewerBase.name;
    const jdText = sessionMetadata.jd_text;

    // Get relevant context from RAG (both resume and portfolio)
    const contextParts: string[] = [];

    if (session.resume_doc_id) {
      console.log('Fetching RAG context for resume:', session.resume_doc_id);
      try {
        const resumeContext = await ragService.getContextForInterview(
          session.user_id,
          content,
          session.resume_doc_id
        );
        if (resumeContext) {
          contextParts.push(`[이력서/자소서]\n${resumeContext}`);
        }
      } catch (e) {
        console.warn('Failed to get resume RAG context:', e);
      }
    }

    if (session.portfolio_doc_id) {
      try {
        const portfolioContext = await ragService.getContextForInterview(
          session.user_id,
          content,
          session.portfolio_doc_id
        );
        if (portfolioContext) {
          contextParts.push(`[포트폴리오]\n${portfolioContext}`);
        }
      } catch (e) {
        console.warn('Failed to get portfolio RAG context:', e);
      }
    }

    const context = contextParts.join('\n\n');

    // Get user's previous interview keywords for continuity
    let userKeywords: UserKeyword[] = [];
    try {
      const { data: keywordsData } = await supabase
        .from('user_keywords')
        .select('keyword, category, context, mentioned_count')
        .eq('user_id', session.user_id)
        .order('mentioned_count', { ascending: false })
        .limit(20);

      if (keywordsData && keywordsData.length > 0) {
        userKeywords = keywordsData.map(kw => ({
          keyword: kw.keyword,
          category: kw.category as UserKeyword['category'],
          context: kw.context || undefined,
          mentioned_count: kw.mentioned_count,
        }));
      }
    } catch (e) {
      console.warn('Failed to load user keywords:', e);
    }

    // Search for relevant interview questions from question bank
    let relevantQuestions: InterviewQuestionSearchResult[] = [];
    try {
      // Map job_categories (26개) to JobCategory (5개 기출문제 카테고리)
      // legal, finance는 별도 카테고리로 기출문제 없음 → 매핑 제외
      const jobCategoryMap: Record<string, JobCategory> = {
        // Frontend 계열
        'frontend': 'frontend',
        'fullstack': 'frontend',
        'mobile': 'frontend',
        'embedded': 'frontend',
        'ui_designer': 'frontend',
        'ux_designer': 'frontend',
        // Backend 계열
        'backend': 'backend',
        'devops': 'backend',
        'security': 'backend',
        'qa': 'backend',
        // PM 계열
        'pm': 'pm',
        'po': 'pm',
        'business_dev': 'pm',
        'customer_success': 'pm',
        // Data 계열
        'data_scientist': 'data',
        'data_analyst': 'data',
        'data_engineer': 'data',
        'ml_engineer': 'data',
        'ai_researcher': 'data',
        // Marketing 계열
        'growth_marketer': 'marketing',
        'content_marketer': 'marketing',
        'sales': 'marketing',
        // 별도 카테고리 (기출문제 없음): legal, finance, hr
      };
      const jobCategory = jobCategoryMap[session.job_type] as JobCategory | undefined;

      // Skip search if job category has no matching question bank (e.g., legal, finance)
      if (jobCategory) {
        // Build search query from context
        const resumeText = context || '';
        const keywordTexts = userKeywords.map(k => k.keyword);

        relevantQuestions = await searchRelevantQuestions(
          resumeText,
          jdText || '',
          keywordTexts,
          jobCategory,
          {
            topK: 3,
            useReranker: true,
          }
        );

        if (relevantQuestions.length > 0) {
          console.log(`Found ${relevantQuestions.length} relevant questions for ${jobCategory}`);
        }
      } else {
        console.log(`No question bank for job_type: ${session.job_type}, skipping question search`);
      }
    } catch (e) {
      console.warn('Failed to search relevant questions:', e);
    }

    // Generate interviewer response with RAG context, keywords, relevant questions, and follow-up logic
    const llmResponse = await generateInterviewerResponse(
      conversationHistory,
      nextInterviewerId,
      session.job_type,
      true, // Use structured output
      context || undefined, // Pass RAG context from resume and portfolio
      {
        userKeywords: userKeywords.length > 0 ? userKeywords : undefined,
        industry: session.industry || undefined,
        difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
        turnCount: session.turn_count + 1,
        // Pass previous interviewer for question transition logic
        previousInterviewerId: isFollowUp ? undefined : currentInterviewerId,
        interviewerMbti,
        jdText: jdText || undefined,
        relevantQuestions: relevantQuestions.length > 0 ? relevantQuestions : undefined,
        // Force new question after 2 consecutive follow-ups
        forceNewQuestion: shouldForceNewTopic || forceNewQuestionFlag,
      }
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

    console.log('Updating session:', {
      newTurnCount,
      shouldEnd,
      isFollowUp,
      shouldForceNewTopic,
      forceNewQuestionFlag
    });

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
        name: interviewerName, // Use session-assigned name
        role: interviewerBase.role,
        emoji: interviewerBase.emoji,
      },
      session_status: shouldEnd ? 'completed' : 'active',
      turn_count: newTurnCount,
      should_end: shouldEnd,
      total_latency_ms: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Error in interview message API:', error);
    
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        api: 'interview-message',
      },
    });
    
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '메시지 처리 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
