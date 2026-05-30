import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { getGeminiAudioModel, getGeminiClient } from "@/lib/gemini";
import { getOpenAIClient, getOpenAITranscribeModel } from "@/lib/openai";
import type { ApiProvider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");
    const provider = normalizeProvider(formData.get("provider"));
    const durationSeconds = formData.get("durationSeconds")?.toString() ?? "unknown";

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "音声ファイルが見つかりません。" }, { status: 400 });
    }

    if (provider === "openai") {
      return await transcribeWithOpenAI(audio, durationSeconds);
    }

    return await transcribeWithGemini(audio, durationSeconds);
  } catch (error) {
    console.error("[transcribe]", error);
    return NextResponse.json(
      { error: formatApiError(error, "文字起こしAPIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}

async function transcribeWithGemini(audio: File, durationSeconds: string) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY または GOOGLE_API_KEY が設定されていません。" },
      { status: 500 }
    );
  }

  const arrayBuffer = await audio.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  const response = await withOneRetryOnUnavailable(() =>
    ai.models.generateContent({
      model: getGeminiAudioModel(),
      contents: [
        {
          text:
            `Transcribe the Japanese speech exactly as Japanese text. The audio duration is ${durationSeconds} seconds. If there is no clear Japanese speech, or the audio is silence/noise only, return an empty string. Do not invent or infer lecture text. The topic is a dental lecture or dental Q&A. Preserve dental terms, numbers, units such as mm and Ncm, anatomical directions, product names, and procedure names. Return only the Japanese transcript text.`
        },
        {
          inlineData: {
            mimeType: audio.type || "audio/wav",
            data: base64Audio
          }
        }
      ]
    })
  );

  return NextResponse.json({ text: response.text?.trim() ?? "" });
}

async function transcribeWithOpenAI(audio: File, durationSeconds: string) {
  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json({ error: "OPENAI_API_KEY が設定されていません。" }, { status: 500 });
  }

  const transcription = await openai.audio.transcriptions.create({
    model: getOpenAITranscribeModel(),
    file: audio,
    language: "ja",
    prompt:
      `Japanese dental lecture, implant dentistry, oral surgery, prosthetics, guided surgery, maxilla, mandible, Ncm, mm. Audio duration: ${durationSeconds} seconds. If there is no clear speech, return an empty transcript. Do not invent content for silence or background noise.`
  });

  return NextResponse.json({ text: transcription.text ?? "" });
}

async function withOneRetryOnUnavailable<T>(request: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    if (!isUnavailableError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 900));
    return await request();
  }
}

function isUnavailableError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { status?: number; code?: string | number; message?: string };
  const message = candidate.message?.toLowerCase() ?? "";
  return candidate.status === 503 || candidate.code === 503 || message.includes("high demand") || message.includes("unavailable");
}

function normalizeProvider(value: FormDataEntryValue | null): ApiProvider {
  return value === "openai" ? "openai" : "gemini";
}
