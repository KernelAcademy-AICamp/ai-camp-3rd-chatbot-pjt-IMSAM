// ============================================
// LLM Router - OpenAI GPT-4o
// ============================================

import OpenAI from 'openai';
import { INTERVIEWERS, type InterviewerType, type StructuredResponse } from '@/types/interview';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LLMRequest {
  messages: ChatMessage[];
  interviewerId: InterviewerType;
  position: string;
  systemPrompt?: string;
  context?: string; // RAG context from documents
  userKeywords?: UserKeyword[]; // Previous interview keywords for continuity
  industry?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  turnCount?: number;
  structuredOutput?: boolean;
  maxTokens?: number;
  temperature?: number;
}

// User keyword from previous interviews
export interface UserKeyword {
  keyword: string;
  category: 'technical' | 'soft_skill' | 'experience' | 'project' | 'strength' | 'weakness';
  context?: string;
  mentioned_count: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  structuredResponse?: StructuredResponse;
  provider: 'openai';
  model: string;
  latencyMs: number;
}

// Structured output JSON schema
const INTERVIEW_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    question: { type: 'string', description: '면접관의 질문 또는 응답' },
    evaluation: {
      type: 'object',
      properties: {
        relevance: { type: 'number', description: '답변 관련성 (0-100)' },
        clarity: { type: 'number', description: '답변 명확성 (0-100)' },
        depth: { type: 'number', description: '답변 깊이 (0-100)' },
      },
      required: ['relevance', 'clarity', 'depth'],
    },
    inner_thought: { type: 'string', description: '면접관의 속마음 (1-2문장)' },
    follow_up_intent: { type: 'boolean', description: '꼬리질문 의도 여부' },
    suggested_follow_up: { type: 'string', description: '다음 꼬리질문 제안' },
  },
  required: ['question', 'evaluation', 'follow_up_intent'],
};

export class LLMRouter {
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    const interviewer = INTERVIEWERS[request.interviewerId];

    console.log('=== LLM Router: generateResponse ===');
    console.log('Interviewer:', request.interviewerId);
    console.log('Position:', request.position);
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key prefix:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

    const systemPrompt = request.systemPrompt || this.buildSystemPrompt(
      interviewer,
      request.position,
      request.context,
      request.userKeywords,
      request.industry,
      request.difficulty,
      request.turnCount
    );

    try {
      const response = await this.callOpenAI({
        ...request,
        systemPrompt,
      });
      console.log('OpenAI call succeeded');
      return {
        ...response,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('=== OpenAI Call Failed ===');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      if (error instanceof Error && 'status' in error) {
        console.error('HTTP Status:', (error as { status: number }).status);
      }
      if (error instanceof Error && 'code' in error) {
        console.error('Error code:', (error as { code: string }).code);
      }
      throw new Error(`LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildSystemPrompt(
    interviewer: typeof INTERVIEWERS[InterviewerType],
    position: string,
    context?: string,
    userKeywords?: UserKeyword[],
    industry?: string,
    difficulty?: 'easy' | 'medium' | 'hard',
    turnCount?: number
  ): string {
    // Base system prompt with interviewer persona
    let prompt = `${interviewer.system_prompt}

## 현재 면접 상황
- 지원 포지션: ${position}
- 산업 분야: ${industry || '일반 IT'}
- 면접 난이도: ${this.getDifficultyLabel(difficulty)}
- 현재 턴: ${turnCount || 1}번째 대화
- 면접관: ${interviewer.name} (${interviewer.role})`;

    // Add document context (resume/portfolio)
    if (context) {
      prompt += `

## 지원자 문서 정보 (이력서/포트폴리오)
${context}

→ 이 정보를 바탕으로 구체적인 경험이나 프로젝트에 대해 질문하세요.
→ 문서에 언급된 기술이나 프로젝트를 직접 언급하며 깊이 파고드세요.`;
    }

    // Add user keywords from previous interviews for continuity
    if (userKeywords && userKeywords.length > 0) {
      prompt += `

## 지원자의 이전 면접 키워드 (스펙 정보)
이 지원자가 이전 면접에서 언급한 핵심 키워드들입니다.
같은 주제를 다른 각도에서 질문하거나, 더 깊이 파고들어 보세요.

${this.formatKeywords(userKeywords)}

→ 이전에 이미 다룬 주제는 다른 각도나 더 심화된 질문으로 접근하세요.
→ 강점으로 언급된 부분은 실제 사례를 더 요청하세요.
→ 약점으로 언급된 부분은 개선 노력을 확인하세요.`;
    }

    // Core interview instructions
    prompt += `

## 핵심 면접 지침

### 1. 대화 기억 및 맥락 유지
- 이전 대화 내용을 반드시 기억하고 참조하세요
- 지원자가 언급한 프로젝트, 기술, 경험을 기억하고 후속 질문에 활용하세요
- "아까 말씀하신 ~에 대해 더 여쭤볼게요" 같은 연결 표현을 사용하세요

### 2. 꼬리질문 전략
- 답변이 모호하면: 구체적인 예시나 수치를 요청하세요
- 답변이 짧으면: "더 자세히 말씀해주시겠어요?" 등으로 확장 유도
- 답변이 좋으면: 다른 각도에서 추가 질문하거나 관련 주제로 확장
- 기술 언급 시: 왜 그 기술을 선택했는지, 장단점은 무엇인지 물어보세요

### 3. 평가 기준
- 답변의 구체성: 실제 경험에 기반한 구체적 사례인지
- 논리적 사고: 문제 분석과 해결 과정이 논리적인지
- 자기인식: 본인의 역할과 기여를 객관적으로 설명하는지
- 성장 가능성: 학습 의지와 발전 방향이 명확한지

### 4. 질문 형식
- 1-2문장의 간결한 질문
- ${interviewer.name}의 성격(${interviewer.personality})에 맞는 말투 유지
- 한국어로 자연스럽게 대화`;

    return prompt;
  }

  private getDifficultyLabel(difficulty?: 'easy' | 'medium' | 'hard'): string {
    switch (difficulty) {
      case 'easy': return '초급 (기본적인 질문 위주)';
      case 'hard': return '고급 (심층 기술 면접)';
      default: return '중급 (실무 경험 기반 질문)';
    }
  }

  private formatKeywords(keywords: UserKeyword[]): string {
    const grouped: Record<string, UserKeyword[]> = {};

    for (const kw of keywords) {
      if (!grouped[kw.category]) {
        grouped[kw.category] = [];
      }
      grouped[kw.category].push(kw);
    }

    const categoryLabels: Record<string, string> = {
      technical: '기술 스택',
      soft_skill: '소프트 스킬',
      experience: '경험',
      project: '프로젝트',
      strength: '강점',
      weakness: '개선점',
    };

    let result = '';
    for (const [category, items] of Object.entries(grouped)) {
      result += `\n[${categoryLabels[category] || category}]\n`;
      for (const item of items) {
        result += `- ${item.keyword}${item.context ? ` (${item.context})` : ''}`;
        if (item.mentioned_count > 1) {
          result += ` - ${item.mentioned_count}회 언급`;
        }
        result += '\n';
      }
    }

    return result;
  }

  private async callOpenAI(request: LLMRequest & { systemPrompt: string }): Promise<Omit<LLMResponse, 'latencyMs'>> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: request.systemPrompt },
      ...request.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    if (request.structuredOutput) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'interview_response',
            strict: true,
            schema: INTERVIEW_RESPONSE_SCHEMA,
          },
        },
        max_tokens: request.maxTokens || 500,
        temperature: request.temperature || 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';
      let structuredResponse: StructuredResponse | undefined;

      try {
        structuredResponse = JSON.parse(content);
      } catch {
        console.error('Failed to parse structured response');
      }

      return {
        content: structuredResponse?.question || content,
        structuredResponse,
        provider: 'openai',
        model: 'gpt-4o',
      };
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: request.maxTokens || 300,
        temperature: request.temperature || 0.7,
      });

      return {
        content: completion.choices[0]?.message?.content || '',
        provider: 'openai',
        model: 'gpt-4o',
      };
    }
  }
}

// Singleton instance
export const llmRouter = new LLMRouter();

// Utility function for simple calls
export async function generateInterviewerResponse(
  messages: ChatMessage[],
  interviewerId: InterviewerType,
  position: string,
  structuredOutput: boolean = false,
  context?: string,
  options?: {
    userKeywords?: UserKeyword[];
    industry?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    turnCount?: number;
  }
): Promise<LLMResponse> {
  return llmRouter.generateResponse({
    messages,
    interviewerId,
    position,
    structuredOutput,
    context,
    ...options,
  });
}

// Keyword extraction function
export async function extractInterviewKeywords(
  conversationHistory: ChatMessage[],
  jobType: string
): Promise<ExtractedKeywords> {
  const systemPrompt = `당신은 면접 분석 전문가입니다.
주어진 면접 대화에서 지원자에 대한 핵심 키워드를 추출합니다.

## 추출 카테고리
1. **technical**: 기술 스택, 프레임워크, 언어, 도구 등
2. **soft_skill**: 커뮤니케이션, 리더십, 팀워크 등 소프트 스킬
3. **experience**: 경력, 경험 연차, 업무 도메인
4. **project**: 언급한 프로젝트명, 프로젝트 유형
5. **strength**: 강점으로 드러난 부분
6. **weakness**: 약점이나 개선이 필요한 부분

## 추출 기준
- 지원자가 직접 언급한 내용만 추출
- 구체적이고 의미있는 키워드만 선별
- 각 키워드에 대해 언급된 맥락 포함
- 같은 키워드가 여러 번 언급되면 횟수 기록

## 출력 형식
JSON 형식으로 응답하세요.`;

  const userPrompt = `다음 면접 대화에서 지원자(user)의 답변을 분석하여 핵심 키워드를 추출하세요.
지원 포지션: ${jobType}

대화 내용:
${conversationHistory.map(m => `[${m.role}]: ${m.content}`).join('\n')}

위 대화에서 지원자에 대한 핵심 키워드를 추출하세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extracted_keywords',
          strict: true,
          schema: KEYWORD_EXTRACTION_SCHEMA,
        },
      },
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Keyword extraction failed:', error);
    return { keywords: [], summary: '' };
  }
}

// Schema for keyword extraction
const KEYWORD_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    keywords: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '키워드' },
          category: {
            type: 'string',
            enum: ['technical', 'soft_skill', 'experience', 'project', 'strength', 'weakness'],
            description: '키워드 카테고리',
          },
          context: { type: 'string', description: '키워드가 언급된 맥락' },
          mentioned_count: { type: 'number', description: '언급 횟수' },
        },
        required: ['keyword', 'category', 'mentioned_count'],
        additionalProperties: false,
      },
    },
    summary: { type: 'string', description: '지원자 요약 (2-3문장)' },
  },
  required: ['keywords', 'summary'],
  additionalProperties: false,
};

export interface ExtractedKeywords {
  keywords: UserKeyword[];
  summary: string;
}
