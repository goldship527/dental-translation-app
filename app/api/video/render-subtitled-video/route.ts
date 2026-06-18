import { NextResponse } from "next/server";
import { renderSubtitledVideo } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

type RenderSubtitledVideoRequest = {
  jobId?: string;
  renderedVideoFileName?: string;
  subtitleFileName?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RenderSubtitledVideoRequest;
    const jobId = body.jobId?.trim() ?? "";
    const renderedVideoFileName = body.renderedVideoFileName?.trim() ?? "";
    const subtitleFileName = body.subtitleFileName?.trim() ?? "";

    if (!jobId || !renderedVideoFileName || !subtitleFileName) {
      return NextResponse.json(
        { error: "英語版MP4と英語字幕SRTが必要です。" },
        { status: 400 }
      );
    }

    const renderedVideo = await renderSubtitledVideo({
      jobId,
      renderedVideoFileName,
      subtitleFileName
    });

    return NextResponse.json({
      fileName: renderedVideo.fileName,
      filePath: renderedVideo.filePath,
      videoUrl: `/api/video/rendered-video?jobId=${encodeURIComponent(jobId)}&fileName=${encodeURIComponent(renderedVideo.fileName)}`
    });
  } catch (error) {
    console.error("[video.render-subtitled-video]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "字幕焼き込み版MP4を書き出せませんでした。"
      },
      { status: 500 }
    );
  }
}
