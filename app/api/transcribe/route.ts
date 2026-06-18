import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { transcribeAudio } from "@/lib/transcription";
import type { ApiProvider, TranscriptionLanguage } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data") && !contentType.includes("application/x-www-form-urlencoded")) {
      return NextResponse.json({ error: "音声ファイルが見つかりません。" }, { status: 400 });
    }

    const formData = await request.formData();
    const audio = formData.get("audio");
    const provider = normalizeProvider(formData.get("provider"));
    const sourceLanguage = normalizeSourceLanguage(formData.get("sourceLanguage"));
    const durationSeconds = formData.get("durationSeconds")?.toString() ?? "unknown";

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "音声ファイルが見つかりません。" }, { status: 400 });
    }

    const text = await transcribeAudio({ audio, provider, durationSeconds, sourceLanguage });
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[transcribe]", error);
    return NextResponse.json(
      { error: formatApiError(error, "文字起こしAPIでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}

function normalizeProvider(value: FormDataEntryValue | null): ApiProvider {
  return value === "openai" ? "openai" : "gemini";
}

function normalizeSourceLanguage(value: FormDataEntryValue | null): TranscriptionLanguage {
  return value === "en" ? "en" : "ja";
}
