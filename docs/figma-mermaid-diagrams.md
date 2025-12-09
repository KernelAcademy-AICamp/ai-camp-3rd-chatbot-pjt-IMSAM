# IMSAM AI Interview - Figma Mermaid 다이어그램

> Mermaid to Figma 플러그인용 코드 모음
> 문서 생성일: 2025년

---

## 1. 서비스 주요 기능 (우선순위별)

### 1-1. 기능 우선순위 맵
```mermaid
flowchart TB
    subgraph Priority1["🥇 1순위 - 핵심 기능"]
        A1[멀티 관점 AI 면접<br/>3인 면접관 시스템]
        A2[실시간 스트리밍 면접<br/>E2E 2.5초 이내]
        A3[RAG 기반 맞춤 질문<br/>하이브리드 검색]
    end

    subgraph Priority2["🥈 2순위 - 분석/평가"]
        B1[5축 역량 평가<br/>가중치 기반 점수]
        B2[음성 분석<br/>WPM/추임새/자신감]
    end

    subgraph Priority3["🥉 3순위 - 부가 기능"]
        C1[대시보드<br/>히스토리/리포트]
        C2[문서 관리<br/>이력서/포트폴리오]
    end

    Priority1 --> Priority2 --> Priority3
```

### 1-2. 3인 면접관 시스템
```mermaid
flowchart LR
    subgraph Interviewers["3인 면접관 시스템"]
        direction TB

        subgraph HM["👨‍💼 채용담당자"]
            HM1[직무 전문성 평가]
            HM2[기술적 깊이 확인]
            HM3[문제 해결력 검증]
        end

        subgraph HR["👩‍💼 HR담당자"]
            HR1[문화 적합성 평가]
            HR2[성장 잠재력 확인]
            HR3[STAR 방법론 활용]
        end

        subgraph SP["👨‍🔬 현직자"]
            SP1[협업 능력 평가]
            SP2[일상 업무 호환성]
            SP3[학습 태도 확인]
        end
    end

    subgraph Personalization["동적 개인화"]
        P1[16가지 MBTI 성격 배정]
        P2[세션별 랜덤 이름 부여]
        P3[성격 기반 질문 스타일]
    end

    Interviewers --> Personalization
```

### 1-3. 실시간 스트리밍 파이프라인
```mermaid
flowchart LR
    A[🎤 음성 입력] --> B[STT<br/>Whisper<br/>500-800ms]
    B --> C[LLM<br/>GPT-4o<br/>800-1200ms]
    C --> D[TTS<br/>OpenAI<br/>300-500ms]
    D --> E[🔊 음성 출력]

    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#e1f5fe
```

### 1-4. RAG 하이브리드 검색
```mermaid
flowchart TB
    subgraph Input["문서 입력"]
        D1[📄 이력서]
        D2[💼 포트폴리오]
        D3[✉️ 자기소개서]
        D4[📋 채용공고 JD]
    end

    subgraph Processing["문서 처리"]
        P1[PDF 파싱<br/>LlamaParse]
        P2[한국어 청킹<br/>800자 단위]
        P3[임베딩 생성<br/>OpenAI]
    end

    subgraph Search["하이브리드 검색"]
        S1[벡터 유사도 검색<br/>60% 가중치]
        S2[BM25 전문 검색<br/>40% 가중치]
    end

    subgraph Rerank["재정렬"]
        R1[Cohere Reranking<br/>+20-30% 정확도]
    end

    Input --> Processing --> Search --> Rerank --> Output[관련 컨텍스트]
```

---

## 2. 사용자 흐름 (User Flow)

### 2-1. 메인 면접 플로우
```mermaid
flowchart TD
    Start([시작]) --> Login[로그인/회원가입]
    Login --> Dashboard[대시보드 홈]

    Dashboard --> History[히스토리 보기]
    Dashboard --> Settings[설정]
    Dashboard --> StartInterview[면접 시작]

    StartInterview --> Setup[면접 설정 페이지]

    subgraph SetupDetails["면접 설정"]
        Setup --> S1[직무 유형 선택]
        S1 --> S2[산업 분야 선택]
        S2 --> S3[난이도 선택]
        S3 --> S4[이력서 업로드<br/>선택사항]
        S4 --> S5[포트폴리오 업로드<br/>선택사항]
        S5 --> S6[JD 붙여넣기<br/>선택사항]
        S6 --> S7[타이머 설정]
    end

    S7 --> Begin[면접 시작]

    subgraph InterviewLoop["면접 진행 (최대 10턴)"]
        Begin --> Record[🎤 음성 녹음]
        Record --> STT[STT 변환]
        STT --> LLM[LLM 질문 생성]
        LLM --> TTS[TTS 음성 출력]
        TTS --> Check{계속?}
        Check -->|예| Record
        Check -->|아니오| EndInterview
    end

    EndInterview[면접 종료] --> Analysis[분석 처리]

    subgraph AnalysisDetails["분석"]
        Analysis --> A1[5축 역량 계산]
        A1 --> A2[합격/불합격 판정]
        A2 --> A3[백분위 산출]
        A3 --> A4[키워드 추출]
    end

    A4 --> Report[결과 리포트]

    subgraph ReportDetails["리포트 내용"]
        Report --> R1[종합 점수]
        R1 --> R2[역량별 분석]
        R2 --> R3[강점/개선점]
        R3 --> R4[음성 분석 결과]
    end

    R4 --> End([종료])
```

### 2-2. 인증 플로우
```mermaid
flowchart TD
    Start([시작]) --> LoginPage[로그인 페이지]

    LoginPage --> Google[Google OAuth]
    LoginPage --> Kakao[Kakao OAuth]
    LoginPage --> Email[Email/Password]

    Google --> AuthCheck{인증 성공?}
    Kakao --> AuthCheck
    Email --> AuthCheck

    AuthCheck -->|실패| LoginPage
    AuthCheck -->|성공| FirstLogin{최초 로그인?}

    FirstLogin -->|예| Onboarding[온보딩]
    FirstLogin -->|아니오| Dashboard[대시보드]

    subgraph OnboardingSteps["온보딩 단계"]
        Onboarding --> O1[이름 입력]
        O1 --> O2[직무 선택]
        O2 --> O3[산업 선택]
    end

    O3 --> Dashboard
    Dashboard --> End([완료])
```

### 2-3. 면접 중 면접관 전환 로직
```mermaid
flowchart TD
    Start([질문 시작]) --> CurrentQ[현재 면접관 질문]
    CurrentQ --> UserAnswer[사용자 답변]
    UserAnswer --> Evaluate[답변 평가]

    Evaluate --> FollowUp{꼬리질문<br/>필요?}

    FollowUp -->|예| CheckCount{꼬리질문<br/>3회 미만?}
    CheckCount -->|예| Probability{55% 확률<br/>동일 면접관?}
    CheckCount -->|아니오| Switch[면접관 교체]

    Probability -->|예| SameInterviewer[동일 면접관<br/>꼬리질문]
    Probability -->|아니오| Switch

    FollowUp -->|아니오| Switch

    SameInterviewer --> NextQ[다음 질문]
    Switch --> SelectNext[다음 면접관 선택]
    SelectNext --> NextQ

    NextQ --> CheckTurn{10턴<br/>도달?}
    CheckTurn -->|아니오| CurrentQ
    CheckTurn -->|예| End([면접 종료])
```

---

## 3. 서비스 아키텍처

### 3-1. 전체 시스템 아키텍처
```mermaid
flowchart TB
    subgraph Client["👤 클라이언트"]
        Web[Web Browser]
        iOS[iOS App]
        Android[Android App]
    end

    subgraph Frontend["Frontend Layer"]
        Next[Next.js 16<br/>App Router]
        React[React 18]
        Tailwind[Tailwind CSS]
        Radix[Radix UI]
        Zustand[Zustand State]
        SWR[SWR Fetching]
        Capacitor[Capacitor<br/>Mobile Bridge]
    end

    subgraph Backend["Backend Layer - Vercel"]
        subgraph APIs["API Routes"]
            Interview[/interview<br/>start, message, end, stream]
            RAG[/rag<br/>upload, evaluate]
            Auth[/auth<br/>logout, delete]
            STT[/stt<br/>Whisper]
            TTS[/tts<br/>OpenAI]
            Profile[/profile<br/>update]
        end
    end

    subgraph AI["AI/ML Services"]
        OpenAI[OpenAI APIs]
        subgraph OpenAIServices["OpenAI"]
            GPT4[GPT-4o<br/>LLM]
            Whisper[Whisper<br/>STT]
            TTSService[TTS-1<br/>TTS]
            Embed[text-embedding-3-small<br/>Embeddings]
        end
        Cohere[Cohere<br/>Reranking]
        LlamaParse[LlamaParse<br/>PDF Parsing]
    end

    subgraph Database["Database Layer"]
        Supabase[(Supabase)]
        subgraph SupabaseServices["Supabase Services"]
            Postgres[(PostgreSQL)]
            pgvector[pgvector<br/>Vector Search]
            SupaAuth[Supabase Auth<br/>Google, Kakao]
            RLS[Row Level Security]
        end
    end

    subgraph Infra["Infrastructure"]
        Vercel[Vercel<br/>Hosting]
        Sentry[Sentry<br/>Error Tracking]
        Clarity[Clarity<br/>Analytics]
    end

    Client --> Frontend
    Frontend --> Backend
    Backend --> AI
    Backend --> Database
    Backend --> Infra
```

### 3-2. 실시간 스트리밍 아키텍처
```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant STT as Whisper STT
    participant LLM as GPT-4o
    participant TTS as OpenAI TTS

    C->>S: 음성 데이터 전송
    S->>C: SSE 연결 시작

    rect rgb(255, 243, 224)
        S->>STT: 음성 변환 요청
        S-->>C: stt_start 이벤트
        STT-->>S: 텍스트 반환 (500-800ms)
        S-->>C: stt_complete 이벤트
    end

    rect rgb(243, 229, 245)
        S->>LLM: 질문 생성 요청
        S-->>C: llm_start 이벤트
        LLM-->>S: 스트리밍 응답 (800-1200ms)
        S-->>C: llm_chunk 이벤트들
        S-->>C: llm_complete 이벤트
    end

    rect rgb(232, 245, 233)
        S->>TTS: 음성 합성 요청
        S-->>C: tts_start 이벤트
        TTS-->>S: 오디오 청크 (300-500ms first)
        S-->>C: tts_chunk 이벤트들
        S-->>C: tts_complete 이벤트
    end

    C->>C: 오디오 재생

    Note over C,TTS: 총 지연 시간: ~2.5초
```

### 3-3. RAG 파이프라인 아키텍처
```mermaid
flowchart TB
    subgraph Upload["문서 업로드"]
        U1[사용자 문서 업로드]
        U2{복잡한 PDF?}
        U1 --> U2
        U2 -->|예| LP[LlamaParse<br/>5-10초]
        U2 -->|아니오| Basic[pdf-parse<br/>1초 이내]
    end

    subgraph Process["문서 처리"]
        LP --> Chunk[한국어 시맨틱 청킹<br/>800자, 100자 오버랩]
        Basic --> Chunk
        Chunk --> Embed[OpenAI Embedding<br/>1536 dimensions]
    end

    subgraph Store["저장"]
        Embed --> Vector[(pgvector<br/>벡터 저장)]
        Embed --> BM25[(PostgreSQL<br/>GIN Index)]
    end

    subgraph Search["검색 시점"]
        Query[질문/컨텍스트] --> Hybrid{하이브리드 검색}
        Vector --> Hybrid
        BM25 --> Hybrid
        Hybrid --> Combine[결과 결합<br/>Vector 60% + BM25 40%]
        Combine --> Rerank[Cohere Reranking<br/>선택적]
        Rerank --> Results[Top-K 결과]
    end

    Results --> LLM[LLM 컨텍스트로 전달]
```

---

## 4. 데이터 모델 (ERD)

### 4-1. 전체 ERD
```mermaid
erDiagram
    profiles ||--o{ interview_sessions : "creates"
    profiles ||--o{ documents : "uploads"
    interview_sessions ||--o{ messages : "contains"
    interview_sessions ||--|| interview_results : "generates"
    interview_results ||--o| speech_analytics : "has"
    interview_results ||--o| emotion_analyses : "has"
    documents }o--o| interview_sessions : "referenced_by"

    profiles {
        uuid id PK
        string name
        string avatar_url
        string job_type
        string industry
        string tier
        timestamp created_at
        timestamp updated_at
    }

    documents {
        uuid id PK
        uuid user_id FK
        string type
        string filename
        text content
        vector embedding
        tsvector content_tsv
        jsonb metadata
        timestamp created_at
    }

    interview_sessions {
        uuid id PK
        uuid user_id FK
        string job_type
        string industry
        string difficulty
        uuid resume_doc_id FK
        uuid portfolio_doc_id FK
        string status
        int turn_count
        int max_turns
        jsonb timer_config
        jsonb interviewer_mbti
        text jd_text
        timestamp created_at
    }

    messages {
        uuid id PK
        uuid session_id FK
        string role
        string interviewer_id
        text content
        jsonb structured_response
        string audio_url
        int latency_ms
        timestamp created_at
    }

    interview_results {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        float overall_score
        string pass_status
        jsonb interviewer_scores
        jsonb competency_scores
        float rank_percentile
        float growth_index
        text feedback_summary
        array strengths
        array improvements
        timestamp created_at
    }

    speech_analytics {
        uuid id PK
        uuid result_id FK
        float words_per_minute
        jsonb filler_words
        jsonb silence_patterns
        float articulation_score
    }

    emotion_analyses {
        uuid id PK
        uuid result_id FK
        jsonb timeline
        jsonb average_scores
    }

    questions {
        uuid id PK
        string category
        string job_type
        string industry
        string difficulty
        text question_text
        array evaluation_points
        text sample_answer
        array follow_ups
    }
```

### 4-2. 핵심 테이블 관계
```mermaid
flowchart LR
    subgraph User["사용자 데이터"]
        P[profiles]
        D[documents]
    end

    subgraph Interview["면접 데이터"]
        S[interview_sessions]
        M[messages]
    end

    subgraph Results["결과 데이터"]
        R[interview_results]
        SA[speech_analytics]
        EA[emotion_analyses]
    end

    P -->|1:N| D
    P -->|1:N| S
    S -->|1:N| M
    S -->|1:1| R
    R -->|1:1| SA
    R -->|1:1| EA
    D -.->|참조| S
```

---

## 5. 데이터 흐름도

### 5-1. 전체 데이터 흐름
```mermaid
flowchart TB
    subgraph Input["사용자 입력"]
        I1[🎤 음성]
        I2[📝 텍스트]
        I3[📄 문서]
    end

    subgraph STTProcess["음성 처리"]
        I1 --> Whisper[Whisper STT]
        Whisper --> Text1[텍스트 변환]
    end

    subgraph DocProcess["문서 처리"]
        I3 --> Parser[PDF Parser]
        Parser --> Chunker[한국어 청킹]
        Chunker --> Embedder[임베딩 생성]
    end

    subgraph Storage["저장소"]
        Embedder --> VectorDB[(Vector DB)]
        Embedder --> TextDB[(Text DB)]
    end

    subgraph Search["검색"]
        VectorDB --> HybridSearch[하이브리드 검색]
        TextDB --> HybridSearch
        HybridSearch --> Context[관련 컨텍스트]
    end

    subgraph LLMProcess["LLM 처리"]
        Text1 --> LLM[GPT-4o]
        I2 --> LLM
        Context --> LLM
        SystemPrompt[시스템 프롬프트] --> LLM
        History[대화 히스토리] --> LLM
    end

    subgraph Output["출력"]
        LLM --> Question[다음 질문]
        LLM --> Evaluation[평가 점수]
        Question --> TTS[TTS 합성]
        TTS --> Audio[🔊 음성 출력]
    end

    subgraph Save["저장"]
        Question --> MessagesDB[(messages)]
        Evaluation --> ResultsDB[(results)]
    end
```

### 5-2. 면접 세션 데이터 흐름
```mermaid
flowchart LR
    subgraph Start["면접 시작"]
        S1[세션 생성]
        S2[MBTI 배정]
        S3[첫 질문 생성]
    end

    subgraph Loop["면접 루프"]
        L1[사용자 답변]
        L2[답변 평가]
        L3[다음 질문 생성]
        L4[메시지 저장]
    end

    subgraph End["면접 종료"]
        E1[전체 평가 계산]
        E2[5축 점수 산출]
        E3[합격 여부 판정]
        E4[리포트 생성]
    end

    Start --> Loop
    L1 --> L2 --> L3 --> L4 --> L1
    Loop --> End
```

---

## 6. 시스템 프롬프트 구조

### 6-1. 프롬프트 구성 요소
```mermaid
flowchart TB
    subgraph Base["기본 페르소나"]
        B1["당신은 {industry} 분야<br/>{job_type} 채용 면접의<br/>{role} '{name}'입니다"]
        B2["성격 유형: {mbti}<br/>{mbti_style}"]
    end

    subgraph Role["역할별 설정"]
        R1["채용담당자<br/>직무 전문성 평가"]
        R2["HR담당자<br/>문화 적합성 평가"]
        R3["현직자<br/>협업 적합성 평가"]
    end

    subgraph Context["컨텍스트 주입"]
        C1["이력서 컨텍스트<br/>{resume_context}"]
        C2["포트폴리오 컨텍스트<br/>{portfolio_context}"]
        C3["채용공고 JD<br/>{job_description}"]
        C4["이전 면접 키워드<br/>{user_keywords}"]
    end

    subgraph Rules["행동 지침"]
        RU1["질문 반복 금지"]
        RU2["답변 에코 금지"]
        RU3["JSON 구조화 출력"]
        RU4["STAR/PREP 평가"]
    end

    subgraph Output["출력 스키마"]
        O1["question: 질문 텍스트"]
        O2["evaluation: 평가 점수"]
        O3["inner_thought: 내부 평가"]
        O4["follow_up_intent: 꼬리질문 여부"]
    end

    Base --> Role --> Context --> Rules --> Output
```

### 6-2. MBTI 성격 스타일 영향
```mermaid
mindmap
    root((MBTI 성격))
        분석형
            INTJ
                전략적 접근
                논리적 질문
            INTP
                호기심 기반
                깊이있는 탐구
        외향형
            ENFP
                열정적 대화
                창의적 질문
            ENTJ
                직접적 스타일
                목표 지향
        감정형
            INFJ
                통찰력 있는
                깊이있는 이해
            ISFJ
                배려하는
                세심한 관찰
        실용형
            ESTJ
                체계적
                효율 중시
            ISTP
                실무 중심
                간결한 표현
```

---

## 7. 5축 역량 평가 체계

### 7-1. 평가 카테고리
```mermaid
pie title 5축 역량 평가 가중치
    "직무 전문성" : 30
    "논리적 구조" : 20
    "태도/커뮤니케이션" : 20
    "회사 적합성" : 15
    "성장 잠재력" : 15
```

### 7-2. 평가 프로세스
```mermaid
flowchart TB
    subgraph Scoring["점수 산출"]
        S1[각 답변별 5축 평가<br/>1-5점 척도]
        S2[면접관별 가중 평균]
        S3[전체 종합 점수]
    end

    subgraph Categories["5대 평가 축"]
        C1["논리적 구조 20%<br/>STAR/PREP 준수"]
        C2["직무 전문성 30%<br/>기술적 깊이"]
        C3["태도/커뮤니케이션 20%<br/>명확성, 자신감"]
        C4["회사 적합성 15%<br/>문화적 정렬"]
        C5["성장 잠재력 15%<br/>학습 마인드셋"]
    end

    subgraph Result["결과 판정"]
        R1{종합 점수}
        R1 -->|80점 이상| Pass[✅ 합격]
        R1 -->|60-79점| Border[⚠️ 보류]
        R1 -->|60점 미만| Fail[❌ 불합격]
    end

    S1 --> S2 --> S3
    Categories --> S1
    S3 --> Result
```

### 7-3. 5단계 평가 척도
```mermaid
flowchart LR
    subgraph Scale["5단계 평가 척도"]
        L1["1점<br/>미흡"]
        L2["2점<br/>부족"]
        L3["3점<br/>보통"]
        L4["4점<br/>우수"]
        L5["5점<br/>탁월"]
    end

    L1 --> L2 --> L3 --> L4 --> L5

    style L1 fill:#ffcdd2
    style L2 fill:#ffe0b2
    style L3 fill:#fff9c4
    style L4 fill:#c8e6c9
    style L5 fill:#a5d6a7
```

---

## 8. 기술 스택

### 8-1. 기술 스택 레이어
```mermaid
flowchart TB
    subgraph Frontend["🎨 Frontend"]
        F1[Next.js 16]
        F2[React 18]
        F3[TypeScript 5.3]
        F4[Tailwind CSS 3.4]
        F5[Radix UI]
        F6[Zustand 5.0]
        F7[SWR 2.2]
        F8[Capacitor 8.0]
    end

    subgraph Backend["⚙️ Backend"]
        B1[Next.js App Router]
        B2[REST APIs]
        B3[SSE Streaming]
        B4[Vercel Serverless]
    end

    subgraph AI["🤖 AI/ML"]
        A1[GPT-4o - LLM]
        A2[Whisper - STT]
        A3[TTS-1 - TTS]
        A4[text-embedding-3-small]
        A5[Cohere Reranking]
        A6[LlamaParse PDF]
    end

    subgraph Database["🗄️ Database"]
        D1[Supabase PostgreSQL]
        D2[pgvector]
        D3[Supabase Auth]
        D4[Row Level Security]
    end

    subgraph Infra["☁️ Infrastructure"]
        I1[Vercel Hosting]
        I2[Sentry Monitoring]
        I3[Clarity Analytics]
    end

    Frontend --> Backend
    Backend --> AI
    Backend --> Database
    Backend --> Infra
```

### 8-2. 인증 시스템
```mermaid
flowchart LR
    subgraph Providers["OAuth Providers"]
        G[Google]
        K[Kakao]
        E[Email/Password]
    end

    subgraph Auth["Supabase Auth"]
        JWT[JWT Token]
        Session[Session Management]
    end

    subgraph Security["보안"]
        RLS[Row Level Security]
        Encrypt[데이터 암호화]
    end

    Providers --> Auth --> Security
```

---

## 9. 성능 지표

### 9-1. 지연 시간 목표
```mermaid
gantt
    title 스트리밍 지연 시간 (ms)
    dateFormat X
    axisFormat %s

    section STT
    Whisper    :0, 800

    section LLM
    GPT-4o     :800, 2000

    section TTS
    First Chunk :2000, 2500

    section Total
    E2E Target :milestone, 2500, 0
```

### 9-2. RAG 성능
```mermaid
xychart-beta
    title "RAG 검색 성능 비교"
    x-axis ["Vector Only", "Hybrid", "Hybrid+Rerank"]
    y-axis "응답시간 (ms)" 0 --> 700
    bar [175, 250, 500]
```

---

## 10. 보안 아키텍처

### 10-1. 보안 레이어
```mermaid
flowchart TB
    subgraph Client["클라이언트"]
        HTTPS[HTTPS Only]
    end

    subgraph API["API Layer"]
        RateLimit[Rate Limiting<br/>20 req/60s]
        Validation[Input Validation]
        XSS[XSS Protection]
    end

    subgraph Auth["인증"]
        JWT[JWT Tokens]
        OAuth[OAuth 2.0]
    end

    subgraph Data["데이터"]
        RLS[Row Level Security]
        Encrypt[필드 암호화]
    end

    subgraph Headers["보안 헤더"]
        H1[X-Frame-Options: DENY]
        H2[X-Content-Type-Options: nosniff]
        H3[X-XSS-Protection: 1]
    end

    Client --> API --> Auth --> Data
    API --> Headers
```

---

*문서 생성일: 2025년*
*프로젝트: IMSAM AI Interview Service*
*Production URL: https://interview.sday.me*
