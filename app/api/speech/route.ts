import { NextResponse } from "next/server";
import { wrapPcmAsWav } from "@/lib/audio";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { getGeminiClient, getGeminiTtsModel } from "@/lib/gemini";
import { getOpenAIClient, getOpenAITtsModel } from "@/lib/openai";
import type { ApiProvider, SpeechLanguage, SpeechVoiceStyle } from "@/lib/types";

export const runtime = "nodejs";

type SpeechBody = {
  provider?: ApiProvider;
  text?: string;
  language?: SpeechLanguage;
  speed?: number;
  voiceStyle?: SpeechVoiceStyle;
};

const openAiVoices: Record<SpeechVoiceStyle, "alloy" | "sage" | "verse"> = {
  standard: "alloy",
  calm: "sage",
  lecture: "verse"
};

const geminiVoices: Record<SpeechVoiceStyle, string> = {
  standard: "Kore",
  calm: "Callirrhoe",
  lecture: "Orus"
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
    const speed = clampSpeed(body.speed ?? 1);
    const voiceStyle = body.voiceStyle ?? "lecture";

    if (provider === "openai") {
      return await createOpenAISpeech({ text, language, speed, voiceStyle });
    }

    return await createGeminiSpeech({ text, language, speed, voiceStyle });
  } catch (error) {
    return NextResponse.json(
      { error: formatApiError(error, "音声生成APIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}

async function createOpenAISpeech({
  text,
  language,
  speed,
  voiceStyle
}: {
  text: string;
  language: SpeechLanguage;
  speed: number;
  voiceStyle: SpeechVoiceStyle;
}) {
  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません。" }, { status: 500 });
  }

  const response = await openai.audio.speech.create({
    model: getOpenAITtsModel(),
    voice: openAiVoices[voiceStyle],
    input: text,
    response_format: "mp3",
    speed,
    instructions: buildSpeechInstruction(language, voiceStyle, speed)
  });

  return new NextResponse(Buffer.from(await response.arrayBuffer()), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store"
    }
  });
}

async function createGeminiSpeech({
  text,
  language,
  speed,
  voiceStyle
}: {
  text: string;
  language: SpeechLanguage;
  speed: number;
  voiceStyle: SpeechVoiceStyle;
}) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY または GOOGLE_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  const response = await ai.models.generateContent({
    model: getGeminiTtsModel(),
    contents: [
      {
        parts: [
          {
            text: `${buildSpeechInstruction(language, voiceStyle, speed)}\n\nRead exactly this text:\n${text}`
          }
        ]
      }
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: geminiVoices[voiceStyle]
          }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Gemini TTSの音声レスポンスを取得できませんでした。");
  }

  const wav = wrapPcmAsWav(Buffer.from(base64Audio, "base64"));
  return new NextResponse(wav, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store"
    }
  });
}

function buildSpeechInstruction(language: SpeechLanguage, voiceStyle: SpeechVoiceStyle, speed: number) {
  const languageLabel = language === "zh" ? "Simplified Chinese" : "English";
  const styleInstruction: Record<SpeechVoiceStyle, string> = {
    standard: "Use a clear, neutral voice.",
    calm: "Use a calm, steady voice suitable for professional communication.",
    lecture: "Use a clear lecture style for dental professionals."
  };
  const pace = speed < 0.95 ? "slightly slower than normal" : speed > 1.05 ? "slightly faster than normal" : "at a natural pace";

  return `Speak in ${languageLabel}. ${styleInstruction[voiceStyle]} Speak ${pace}. This is AI-generated audio for lecture translation support.`;
}

function clampSpeed(speed: number) {
  if (!Number.isFinite(speed)) return 1;
  return Math.min(1.2, Math.max(0.8, speed));
}
