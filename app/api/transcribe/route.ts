import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// ============================================
// 📌 STT API - Speech-to-Text Transcription
// ============================================
// POST /api/transcribe
// - 음성 파일을 받아서 OpenAI Whisper API로 텍스트 변환
// - 결과를 JSON으로 반환 (Vercel serverless 환경용)
//
// 테스트 모드: .env.local에 TEST_MODE=true 추가 시
// OpenAI API 호출 없이 모의(mock) 응답 반환

// TEST_MODE가 활성화되지 않은 경우에만 OpenAI 클라이언트 초기화
const TEST_MODE = process.env.TEST_MODE === "true";
const openai = TEST_MODE
  ? null
  : new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY,
    });

export async function POST(req: NextRequest) {
  try {
        // 1. FormData에서 오디오 파일 가져오기
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "오디오 파일이 없습니다." }, { status: 400 });
    }

    // 2. File 객체를 Buffer로 변환
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let transcriptionText: string = "";

    // 3. OpenAI Whisper API로 음성→텍스트 변환 (또는 테스트 모드)
    if (TEST_MODE) {
      // 테스트 모드: 모의 응답 반환
      console.log("🧪 TEST_MODE: OpenAI API 호출 건너뛰기");
      transcriptionText =
        "[테스트 모드] 이것은 모의 음성 변환 텍스트입니다. 실제 OpenAI API를 사용하려면 TEST_MODE를 false로 설정하고 유효한 API 키와 크레딧을 확인하세요.";
    } else {
      // 실제 OpenAI API 호출
      if (!openai) {
        throw new Error("OpenAI client is not initialized");
      }

      const transcription = await openai!.audio.transcriptions.create({
        model: "whisper-1",
        file: new File([buffer], "audio.wav", { type: "audio/wav" }),
        language: "ko",
      });

      transcriptionText = transcription.text;
    }

    // 4. 결과 반환 (파일 저장 없이 텍스트만 반환)
    return NextResponse.json({
      success: true,
      text: transcriptionText,
      timestamp: new Date().toISOString(),
      testMode: TEST_MODE,
    });
  } catch (err: any) {
    console.error("STT Error:", err);

    return NextResponse.json(
      {
        error: "음성 변환 중 오류 발생",
        details: err.message || err,
      },
      { status: 500 },
    );
  }
}
