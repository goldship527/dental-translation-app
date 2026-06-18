import { NextResponse } from "next/server";
import { renderEnglishVideo } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

type RenderEnglishVideoRequest = {
  jobId?: string;
  sourceFileName?: string;
  narrationFileName?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RenderEnglishVideoRequest;
    const jobId = body.jobId?.trim() ?? "";
    const sourceFileName = body.sourceFileName?.trim() ?? "";
    const narrationFileName = body.narrationFileName?.trim() ?? "";

    if (!jobId || !sourceFileName || !narrationFileName) {
      return NextResponse.json(
        { error: "元動画と英語ナレーション音声が必要です。" },
        { status: 400 }
      );
    }

    const renderedVideo = await renderEnglishVideo({
      jobId,
      sourceFileName,
      narrationFileName
    });

    return NextResponse.json({
      fileName: renderedVideo.fileName,
      filePath: renderedVideo.filePath,
      videoUrl: `/api/video/rendered-video?jobId=${encodeURIComponent(jobId)}&fileName=${encodeURIComponent(renderedVideo.fileName)}`
    });
  } catch (error) {
    console.error("[video.render-english-video]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "英語版MP4を書き出せませんでした。"
      },
      { status: 500 }
    );
  }
}
