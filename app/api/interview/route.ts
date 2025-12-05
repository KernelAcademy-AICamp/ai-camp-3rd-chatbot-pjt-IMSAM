import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ============================================
// Interview Chat API - LLM 기반 면접관 응답
// ============================================
// POST /api/interview
// - 사용자 답변을 받아서 면접관 역할의 LLM 응답 생성
// - 3인의 면접관이 돌아가며 질문

const TEST_MODE = process.env.TEST_MODE === "true";
const openai = TEST_MODE
  ? null
  : new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
    });

// 면접관 프로필
const INTERVIEWERS = {
  "tech-lead": {
    name: "김기술",
    role: "실무팀장",
    weight: 0.4, // 40% 비중
    systemPrompt: `당신은 IT 기업의 실무팀장 '김기술'입니다.
기술적 역량과 문제해결 능력을 평가합니다.
- 구체적인 기술 스택과 구현 경험을 물어봅니다
- 시스템 설계와 아키텍처에 대한 이해도를 확인합니다
- 트레이드오프와 기술 선택 이유를 질문합니다
- 디버깅 경험과 문제해결 과정을 물어봅니다

답변 스타일:
- 전문적이고 논리적으로 질문
- 기술적 깊이를 파악하는 꼬리질문
- 1-2문장의 간결한 질문`,
  },
  "hr-manager": {
    name: "박인사",
    role: "HR 담당자",
    weight: 0.2, // 20% 비중
    systemPrompt: `당신은 IT 기업의 HR 담당자 '박인사'입니다.
커뮤니케이션 능력과 조직 적합성을 평가합니다.
- 팀워크와 협업 경험을 물어봅니다
- 갈등 해결과 커뮤니케이션 방식을 확인합니다
- 회사 문화 적합성과 성장 의지를 파악합니다
- 장단점과 자기 인식을 질문합니다

답변 스타일:
- 따뜻하지만 날카로운 질문
- 행동 기반 질문 (STAR 기법)
- 1-2문장의 자연스러운 질문`,
  },
  "senior-peer": {
    name: "이시니어",
    role: "시니어 동료",
    weight: 0.4, // 40% 비중
    systemPrompt: `당신은 IT 기업의 시니어 개발자 '이시니어'입니다.
실무 역량과 동료로서의 적합성을 평가합니다.
- 실제 프로젝트 경험과 기여도를 물어봅니다
- 코드 리뷰와 협업 방식을 확인합니다
- 학습 능력과 성장 가능성을 파악합니다
- 동료로서 함께 일하고 싶은지 판단합니다

답변 스타일:
- 친근하지만 전문적인 질문
- 실무 경험 중심의 구체적 질문
- 1-2문장의 대화체 질문`,
  },
};

interface Message {
  role: "user" | "interviewer";
  content: string;
  interviewerId?: string;
}

interface RequestBody {
  userMessage: string;
  interviewerId: string;
  conversationHistory: Message[];
  position?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { userMessage, interviewerId, conversationHistory, position = "개발자" } = body;

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: "사용자 메시지가 없습니다." },
        { status: 400 }
      );
    }

    const interviewer = INTERVIEWERS[interviewerId as keyof typeof INTERVIEWERS];
    if (!interviewer) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 면접관입니다." },
        { status: 400 }
      );
    }

    let responseText: string;

    if (TEST_MODE) {
      // 테스트 모드: 모의 응답
      console.log("🧪 TEST_MODE: LLM API 호출 건너뛰기");
      const mockResponses = [
        "좋은 답변이네요. 그 경험에서 가장 어려웠던 기술적 도전은 무엇이었나요?",
        "흥미롭네요. 해당 기술을 선택한 구체적인 이유와 다른 대안은 고려하지 않았나요?",
        "그 상황에서 팀원들과 어떻게 소통하고 협업했는지 좀 더 설명해주시겠어요?",
        "만약 다시 그 프로젝트를 진행한다면 어떤 점을 다르게 하시겠어요?",
        "그 성과를 수치로 표현할 수 있을까요? 예를 들어 성능 개선이나 비용 절감 등으로요.",
      ];
      responseText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    } else {
      if (!openai) {
        throw new Error("OpenAI client is not initialized");
      }

      // 대화 히스토리 구성
      const messages: OpenAI.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `${interviewer.systemPrompt}

현재 면접 상황:
- 지원 포지션: ${position}
- 면접 진행 중

중요 지침:
1. 지원자의 답변을 경청하고 적절한 꼬리질문을 합니다
2. 답변이 불충분하면 더 구체적인 예시를 요청합니다
3. 답변이 좋으면 다른 관점에서 추가 질문을 합니다
4. 한국어로 자연스럽게 대화합니다
5. 질문은 1-2문장으로 간결하게 합니다`,
        },
      ];

      // 이전 대화 히스토리 추가
      conversationHistory.forEach((msg) => {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.content });
        } else {
          messages.push({ role: "assistant", content: msg.content });
        }
      });

      // 현재 사용자 메시지 추가
      messages.push({ role: "user", content: userMessage });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 비용 효율적인 모델
        messages,
        max_tokens: 200,
        temperature: 0.7,
      });

      responseText = completion.choices[0]?.message?.content || "질문을 생각해보겠습니다...";
    }

    return NextResponse.json({
      success: true,
      response: responseText,
      interviewer: {
        id: interviewerId,
        name: interviewer.name,
        role: interviewer.role,
      },
      timestamp: new Date().toISOString(),
      testMode: TEST_MODE,
    });
  } catch (err: unknown) {
    console.error("Interview API Error:", err);

    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "면접관 응답 생성 중 오류가 발생했습니다.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
