import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { createSpeechAudio } from "@/lib/speech";
import type { ApiProvider } from "@/lib/types";
import { writeNarrationAudio } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

type GenerateNarrationRequest = {
  jobId?: string;
  provider?: ApiProvider;
  text?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateNarrationRequest;
    const jobId = body.jobId?.trim() ?? "";
    const text = body.text?.trim() ?? "";
    const provider = body.provider === "openai" ? "openai" : "gemini";

    if (!jobId) {
      return NextResponse.json({ error: "動画ローカライズの作業IDが見つかりません。" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "ナレーションにする英訳原稿がありません。" }, { status: 400 });
    }

    if (text.length > 4096) {
      return NextResponse.json(
        { error: "ナレーション原稿が長すぎます。初期MVPでは4096文字以内の検証動画でお試しください。" },
        { status: 400 }
      );
    }

    const speech = await createSpeechAudio({
      provider,
      text,
      language: "en",
      speed: 1,
      voiceStyle: "standard"
    });
    const narration = await writeNarrationAudio({
      jobId,
      extension: speech.extension,
      buffer: speech.buffer
    });

    return NextResponse.json({
      fileName: narration.fileName,
      filePath: narration.filePath,
      contentType: speech.contentType,
      audioUrl: `/api/video/narration-audio?jobId=${encodeURIComponent(jobId)}&fileName=${encodeURIComponent(narration.fileName)}`
    });
  } catch (error) {
    console.error("[video.generate-narration]", error);
    return NextResponse.json(
      { error: formatApiError(error, "英語ナレーション生成でエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}
