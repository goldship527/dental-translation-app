import { NextResponse } from "next/server";
import { createDistributionPackage } from "@/lib/video";

export const runtime = "nodejs";

type CreatePackageRequest = {
  jobId?: string;
  sourceFileName?: string;
  renderedVideoFileName?: string;
  subtitleFileName?: string;
  burnedInSubtitles?: boolean;
  transcriptText?: unknown;
  englishText?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePackageRequest;
    const jobId = body.jobId?.trim() ?? "";
    const sourceFileName = body.sourceFileName?.trim() ?? "";
    const renderedVideoFileName = body.renderedVideoFileName?.trim() ?? "";
    const subtitleFileName = body.subtitleFileName?.trim() || undefined;
    const burnedInSubtitles = body.burnedInSubtitles === true;
    const transcriptText = typeof body.transcriptText === "string" ? body.transcriptText.trim() : "";
    const englishText = typeof body.englishText === "string" ? body.englishText.trim() : "";

    if (!jobId || !sourceFileName || !renderedVideoFileName) {
      return NextResponse.json({ error: "配布用パッケージに必要な動画情報が不足しています。" }, { status: 400 });
    }

    if (!transcriptText || !englishText) {
      return NextResponse.json({ error: "文字起こしと英訳原稿が必要です。" }, { status: 400 });
    }

    const result = await createDistributionPackage({
      jobId,
      sourceFileName,
      renderedVideoFileName,
      subtitleFileName,
      burnedInSubtitles,
      transcriptText,
      englishText
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[video.create-package]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "配布用パッケージを作成できませんでした。"
      },
      { status: 500 }
    );
  }
}
