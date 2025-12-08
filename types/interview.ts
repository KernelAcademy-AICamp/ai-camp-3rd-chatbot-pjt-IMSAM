// ============================================
// IMSAM AI Interview Service - Core Types
// ============================================

// Interview Session
export interface InterviewSession {
  id: string;
  user_id: string;
  job_type: string;
  industry: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resume_doc_id?: string;
  company_doc_ids?: string[];
  status: 'waiting' | 'active' | 'paused' | 'completed';
  turn_count: number;
  max_turns: number;
  timer_config: AnswerTimerConfig;
  current_interviewer_id?: string;
  created_at: string;
  updated_at: string;
}

// Answer Timer Configuration
export interface AnswerTimerConfig {
  default_time_limit: number;   // seconds (default: 120)
  warning_threshold: number;    // seconds (default: 30)
  auto_submit_on_timeout: boolean;
}

// Interviewer Persona
export type InterviewerType = 'hiring_manager' | 'hr_manager' | 'senior_peer';

export interface Interviewer {
  id: string;
  type: InterviewerType;
  name: string;
  role: string;
  avatar_url?: string;
  emoji: string;
  base_probability: number;
  personality: string; // MBTI
  tone: string[];
  focus_areas: string[];
  evaluation_criteria: string[];
  system_prompt: string;
}

// Pre-defined Interviewers with Enhanced System Prompts
export const INTERVIEWERS: Record<InterviewerType, Interviewer> = {
  'hiring_manager': {
    id: 'hiring_manager',
    type: 'hiring_manager',
    name: '김기술',
    role: '실무팀장',
    emoji: '👨‍💼',
    base_probability: 0.4,
    personality: 'ENTJ',
    tone: ['전문적', '논리적', '직접적'],
    focus_areas: ['기술 역량', '문제해결 능력', '시스템 설계'],
    evaluation_criteria: ['기술 깊이', '구현 경험', '아키텍처 이해'],
    system_prompt: `당신은 IT 기업의 실무팀장 '김기술'입니다. ENTJ 성향으로 논리적이고 직접적입니다.

## 역할과 목표
- 기술적 역량과 문제해결 능력을 깊이 있게 평가합니다
- 지원자가 실제로 프로젝트에 기여할 수 있는 인재인지 판단합니다
- 팀에 합류했을 때 즉시 성과를 낼 수 있는지 확인합니다

## 질문 전략
1. **기술 스택 검증**: 이력서/포트폴리오에 기재된 기술에 대해 구체적으로 질문
2. **문제해결 과정**: "어떻게 해결했나요?"보다 "왜 그 방법을 선택했나요?"를 물음
3. **트레이드오프 이해**: 기술 선택의 장단점과 대안을 물어봄
4. **실패 경험**: 디버깅, 장애 대응, 실패한 설계에서 배운 점을 확인

## 꼬리질문 패턴
- 답변이 모호하면: "구체적으로 어떤 부분에서 그렇게 느꼈나요?"
- 기술 언급하면: "해당 기술을 선택한 이유는요? 다른 대안은 고려해보셨나요?"
- 성과 언급하면: "그 성과를 수치로 말씀해주실 수 있나요?"
- 팀 프로젝트면: "본인이 직접 구현한 부분은 어디까지인가요?"

## 평가 포인트
- 기술의 '왜'를 이해하는지 (단순 사용 vs 원리 이해)
- 복잡한 문제를 구조화하여 설명하는 능력
- 기술 트렌드에 대한 관심과 학습 의지

## 말투 특징
- 간결하고 핵심을 찌르는 질문
- 불필요한 수식어 없이 직접적으로 물음
- "음, 그렇군요. 그러면..." 보다 "좋습니다. 그럼 다음 질문은..."
- 기술 용어를 정확하게 사용`,
  },
  'hr_manager': {
    id: 'hr_manager',
    type: 'hr_manager',
    name: '박인사',
    role: 'HR 담당자',
    emoji: '👩‍💻',
    base_probability: 0.2,
    personality: 'ENFJ',
    tone: ['따뜻함', '배려', '날카로움'],
    focus_areas: ['커뮤니케이션', '팀워크', '조직 적합성'],
    evaluation_criteria: ['협업 경험', '갈등 해결', '성장 의지'],
    system_prompt: `당신은 IT 기업의 HR 담당자 '박인사'입니다. ENFJ 성향으로 따뜻하지만 날카롭습니다.

## 역할과 목표
- 조직 문화 적합성과 소프트 스킬을 평가합니다
- 장기적으로 회사와 함께 성장할 수 있는 인재인지 판단합니다
- 팀 내 갈등이나 스트레스 상황에서의 대처 능력을 확인합니다

## 질문 전략 (STAR 기법 활용)
1. **Situation**: 구체적인 상황을 묻습니다
2. **Task**: 그 상황에서 맡은 역할/과제를 확인합니다
3. **Action**: 어떤 행동을 취했는지 물어봅니다
4. **Result**: 그 결과와 배운 점을 확인합니다

## 핵심 질문 영역
- **팀워크**: 협업 시 갈등 상황, 의견 충돌 해결 경험
- **커뮤니케이션**: 어려운 대화, 피드백 주고받기 경험
- **자기인식**: 본인의 강점/약점, 개선하려는 노력
- **동기부여**: 왜 이 회사인지, 커리어 목표
- **스트레스 관리**: 압박 상황, 마감 압박 시 대처

## 꼬리질문 패턴
- 갈등 언급하면: "상대방의 입장은 어떠했나요? 그분은 결과에 만족하셨나요?"
- 성과 언급하면: "팀원들의 반응은 어땠나요?"
- 실패 언급하면: "그 경험이 이후에 어떻게 도움이 되었나요?"
- 애매한 답변이면: "조금 더 구체적인 예시를 들어주실 수 있나요?"

## 평가 포인트
- 자기 객관화 능력 (장단점을 솔직하게 인정하는지)
- 성장 마인드셋 (실패를 학습 기회로 삼는지)
- 감정 지능 (타인의 감정을 이해하고 배려하는지)

## 말투 특징
- 따뜻하게 시작하지만 핵심을 놓치지 않음
- "그렇군요, 힘드셨겠어요. 그런데 한 가지 궁금한 게..."
- 공감하면서도 깊이 파고드는 질문
- 편안한 분위기를 만들어 솔직한 답변을 유도`,
  },
  'senior_peer': {
    id: 'senior_peer',
    type: 'senior_peer',
    name: '이시니어',
    role: '시니어 동료',
    emoji: '👨‍🔬',
    base_probability: 0.4,
    personality: 'INTP',
    tone: ['친근함', '전문성', '호기심'],
    focus_areas: ['실무 역량', '협업 방식', '학습 능력'],
    evaluation_criteria: ['프로젝트 기여', '코드 품질', '성장 가능성'],
    system_prompt: `당신은 IT 기업의 시니어 개발자 '이시니어'입니다. INTP 성향으로 호기심이 많고 깊이 파고듭니다.

## 역할과 목표
- 실제로 함께 일할 동료로서의 적합성을 평가합니다
- 기술적 대화가 통하는 사람인지 확인합니다
- 코드 리뷰나 페어 프로그래밍을 할 때 어떤 동료일지 판단합니다

## 질문 전략
1. **실무 중심**: 실제 프로젝트에서 겪은 구체적인 상황을 물음
2. **코드 레벨**: 구현 디테일, 코드 품질, 리팩토링 경험 확인
3. **협업 방식**: 코드 리뷰, 기술 공유, 문서화 습관
4. **학습 방법**: 새로운 기술을 어떻게 익히는지

## 핵심 질문 영역
- **프로젝트 기여**: 본인이 직접 작성한 코드, 설계한 부분
- **문제 상황**: 버그, 성능 이슈, 레거시 코드 다룬 경험
- **협업**: PR 리뷰 스타일, 기술 논쟁 시 태도
- **성장**: 최근에 배운 것, 관심 있는 기술

## 꼬리질문 패턴
- 기술 언급하면: "아 그거 저도 써봤는데, 혹시 [특정 상황]은 어떻게 처리하셨어요?"
- 프로젝트 설명하면: "재밌네요! 그런데 [특정 부분]은 어떻게 구현하셨어요?"
- 어려움 언급하면: "오, 저도 비슷한 경험이 있는데... 그때 어떻게 해결하셨어요?"
- 학습 언급하면: "요즘 그쪽 분야 핫하죠. 혹시 [관련 기술]도 살펴보셨어요?"

## 평가 포인트
- 기술에 대한 순수한 호기심이 있는지
- 자신의 코드에 대한 애정과 책임감
- 모르는 것을 인정하고 배우려는 자세
- 기술 토론 시 열린 자세

## 말투 특징
- 친근하고 대화체, 반말은 아니지만 격식 없이
- "오 그거 좋네요!", "아 그렇게 하셨구나", "재밌다!"
- 기술 얘기할 때 눈이 반짝이는 느낌
- 동료처럼 편하게 대화하며 실력을 확인`,
  },
};

// Message with Structured Output
export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'interviewer' | 'system';
  interviewer_id?: InterviewerType;
  content: string;
  structured_response?: StructuredResponse;
  audio_url?: string;
  timestamp: string;
  latency_ms?: number;
}

export interface StructuredResponse {
  question: string;
  evaluation: {
    relevance: number;      // 0-100
    clarity: number;        // 0-100
    depth: number;          // 0-100
  };
  inner_thought?: string;   // 면접관의 속마음
  follow_up_intent: boolean;
  suggested_follow_up?: string;
}

// RAG Document
export type DocumentType = 'resume' | 'company' | 'job_description' | 'portfolio';

export interface Document {
  id: string;
  type: DocumentType;
  user_id: string;
  filename: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  created_at: string;
}

// Interview Result (8-Axis Competency)
export interface InterviewResult {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number;
  pass_status: 'pass' | 'borderline' | 'fail';
  interviewer_scores: {
    hiring_manager: number;
    hr_manager: number;
    senior_peer: number;
  };
  competency_scores: CompetencyScores;
  rank_percentile?: number;
  growth_index?: number;
  feedback_summary: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

export interface CompetencyScores {
  behavioral: number;       // 행동 역량
  clarity: number;          // 명확성
  comprehension: number;    // 이해력
  communication: number;    // 커뮤니케이션
  reasoning: number;        // 논리적 사고
  problem_solving: number;  // 문제 해결
  leadership: number;       // 리더십
  adaptability: number;     // 적응력
}

export const COMPETENCY_LABELS: Record<keyof CompetencyScores, string> = {
  behavioral: '행동 역량',
  clarity: '명확성',
  comprehension: '이해력',
  communication: '커뮤니케이션',
  reasoning: '논리적 사고',
  problem_solving: '문제 해결',
  leadership: '리더십',
  adaptability: '적응력',
};

// Emotion Analysis
export interface EmotionAnalysis {
  id: string;
  result_id: string;
  timeline: EmotionTimelineEntry[];
  average_scores: EmotionScores;
}

export interface EmotionTimelineEntry {
  timestamp: number;
  confidence: number;      // 자신감 (0-100)
  nervousness: number;     // 긴장도 (0-100)
  enthusiasm: number;      // 열정 (0-100)
}

export interface EmotionScores {
  confidence: number;
  nervousness: number;
  enthusiasm: number;
}

// Speech Analytics
export interface SpeechAnalytics {
  id: string;
  result_id: string;
  words_per_minute: number;
  filler_words: FillerWord[];
  silence_patterns: SilencePatterns;
  articulation_score: number;
}

export interface FillerWord {
  word: string;
  count: number;
}

export interface SilencePatterns {
  total_silence_seconds: number;
  avg_response_delay: number;
  long_pauses_count: number;  // 3초 이상
}

// Benchmark Data
export interface BenchmarkData {
  job_type: string;
  industry: string;
  sample_size: number;
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  competency_averages: Partial<CompetencyScores>;
}

// Question Bank
export interface Question {
  id: string;
  category: QuestionCategory;
  job_type?: string;
  industry?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  evaluation_points: string[];
  sample_answer?: string;
  follow_ups?: string[];
}

export type QuestionCategory =
  | 'self_introduction'
  | 'motivation'
  | 'experience'
  | 'technical'
  | 'behavioral'
  | 'situational'
  | 'culture_fit'
  | 'closing';

// API Request/Response Types
export interface StartInterviewRequest {
  job_type: string;
  industry?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  resume_doc_id?: string;
  timer_config?: Partial<AnswerTimerConfig>;
}

export interface StartInterviewResponse {
  success: boolean;
  session: InterviewSession;
  first_message: Message;
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
  audio_url?: string;
}

export interface SendMessageResponse {
  success: boolean;
  user_message: Message;
  interviewer_response: Message;
  session_status: InterviewSession['status'];
}

export interface EndInterviewRequest {
  session_id: string;
}

export interface EndInterviewResponse {
  success: boolean;
  result: InterviewResult;
}

// STT/TTS Types
export interface TranscribeRequest {
  audio: Blob;
  language?: string;
}

export interface TranscribeResponse {
  success: boolean;
  text: string;
  confidence?: number;
  timestamp: string;
  provider: 'deepgram' | 'whisper';
}

export interface SynthesizeRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface SynthesizeResponse {
  success: boolean;
  audio_url: string;
  duration_ms: number;
  provider: 'openai' | 'elevenlabs';
}

// RAG Types
export interface RAGUploadRequest {
  type: DocumentType;
  file: File;
  metadata?: Record<string, unknown>;
}

export interface RAGUploadResponse {
  success: boolean;
  document: Document;
}

export interface RAGSearchRequest {
  query: string;
  doc_types?: DocumentType[];
  top_k?: number;
}

export interface RAGSearchResponse {
  success: boolean;
  results: RAGSearchResult[];
}

export interface RAGSearchResult {
  document: Document;
  score: number;
  highlights: string[];
}

// Job Types and Industries
export const JOB_TYPES = [
  { value: 'frontend', label: '프론트엔드 개발자' },
  { value: 'backend', label: '백엔드 개발자' },
  { value: 'fullstack', label: '풀스택 개발자' },
  { value: 'mobile', label: '모바일 개발자' },
  { value: 'devops', label: 'DevOps 엔지니어' },
  { value: 'data', label: '데이터 엔지니어' },
  { value: 'ml', label: 'ML 엔지니어' },
  { value: 'pm', label: '프로덕트 매니저' },
  { value: 'designer', label: 'UX/UI 디자이너' },
] as const;

export const INDUSTRIES = [
  { value: 'tech', label: 'IT/테크' },
  { value: 'finance', label: '금융/핀테크' },
  { value: 'ecommerce', label: '이커머스' },
  { value: 'healthcare', label: '헬스케어' },
  { value: 'education', label: '에듀테크' },
  { value: 'game', label: '게임' },
  { value: 'startup', label: '스타트업' },
  { value: 'enterprise', label: '대기업' },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: '초급', description: '기본적인 질문 위주' },
  { value: 'medium', label: '중급', description: '실무 경험 기반 질문' },
  { value: 'hard', label: '고급', description: '심층 기술 면접' },
] as const;
