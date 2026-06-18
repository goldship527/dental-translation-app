import { NextResponse } from "next/server";
import { formatApiError, getApiErrorStatus } from "@/lib/api-errors";
import { transcribeJapaneseAudio } from "@/lib/transcription";
import type { ApiProvider } from "@/lib/types";
import { readExtractedAudio } from "@/lib/video";

export const runtime = "nodejs";
export const maxDuration = 300;

type TranscribeAudioRequest = {
  jobId?: string;
  audioFileName?: string;
  provider?: ApiProvider;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranscribeAudioRequest;
    const jobId = body.jobId?.trim() ?? "";
    const audioFileName = body.audioFileName?.trim() ?? "";
    const provider = body.provider === "openai" ? "openai" : "gemini";

    if (!jobId || !audioFileName) {
      return NextResponse.json({ error: "抽出済み音声が見つかりません。" }, { status: 400 });
    }

    const extractedAudio = await readExtractedAudio(jobId, audioFileName);
    const audioBytes = new Uint8Array(extractedAudio.buffer.byteLength);
    audioBytes.set(extractedAudio.buffer);
    const audio = new File([audioBytes], extractedAudio.audioFileName, {
      type: "audio/wav"
    });
    const text = await transcribeJapaneseAudio({
      audio,
      provider,
      durationSeconds: extractedAudio.durationSeconds
    });

    return NextResponse.json({
      text,
      audioPath: extractedAudio.audioPath,
      durationSeconds: extractedAudio.durationSeconds
    });
  } catch (error) {
    console.error("[video.transcribe-audio]", error);
    return NextResponse.json(
      { error: formatApiError(error, "抽出済み音声の文字起こしでエラーが発生しました。") },
      { status: getApiErrorStatus(error) }
    );
  }
}
