import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { clampSpeechSpeed, createSpeechAudio } from "@/lib/speech";
import type { ApiProvider, SpeechLanguage, SpeechVoiceStyle } from "@/lib/types";

export const runtime = "nodejs";

type SpeechBody = {
  provider?: ApiProvider;
  text?: string;
  language?: SpeechLanguage;
  speed?: number;
  voiceStyle?: SpeechVoiceStyle;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpeechBody;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "読み上げるテキストがありません。" }, { status: 400 });
    }

    if (text.length > 4096) {
      return NextResponse.json({ error: "読み上げテキストが長すぎます。4096文字以内にしてください。" }, { status: 400 });
    }

    const provider = body.provider ?? "gemini";
    const language = body.language ?? "en";
    const speed = clampSpeechSpeed(body.speed ?? 1);
    const voiceStyle = body.voiceStyle ?? "lecture";
    const speech = await createSpeechAudio({ provider, text, language, speed, voiceStyle });
    const audioBytes = new Uint8Array(speech.buffer.byteLength);
    audioBytes.set(speech.buffer);

    return new NextResponse(audioBytes, {
      headers: {
        "Content-Type": speech.contentType,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error("[speech]", error);
    return NextResponse.json(
      { error: formatApiError(error, "音声生成APIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}
