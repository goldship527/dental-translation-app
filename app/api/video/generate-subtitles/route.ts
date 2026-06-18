import { NextResponse } from "next/server";
import { generateEnglishSrt } from "@/lib/subtitles";
import { writeSubtitleFile } from "@/lib/video";

export const runtime = "nodejs";

type GenerateSubtitlesRequest = {
  jobId?: string;
  text?: unknown;
  durationSeconds?: string | number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateSubtitlesRequest;
    const jobId = body.jobId?.trim() ?? "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!jobId) {
      return NextResponse.json({ error: "動画ローカライズの作業IDが見つかりません。" }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: "字幕にする英訳原稿がありません。" }, { status: 400 });
    }

    const srt = generateEnglishSrt(text, body.durationSeconds);
    if (!srt) {
      return NextResponse.json({ error: "字幕を生成できませんでした。" }, { status: 400 });
    }

    const subtitles = await writeSubtitleFile(jobId, srt);

    return NextResponse.json({
      fileName: subtitles.fileName,
      filePath: subtitles.filePath,
      srt,
      subtitleUrl: `/api/video/subtitles?jobId=${encodeURIComponent(jobId)}&fileName=${encodeURIComponent(subtitles.fileName)}`
    });
  } catch (error) {
    console.error("[video.generate-subtitles]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "英語字幕SRTを生成できませんでした。"
      },
      { status: 500 }
    );
  }
}
