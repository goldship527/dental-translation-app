import { getGeminiAudioModel, getGeminiClient } from "@/lib/gemini";
import { getOpenAIClient, getOpenAITranscribeModel } from "@/lib/openai";
import type { ApiProvider, TranscriptionLanguage } from "@/lib/types";

export async function transcribeAudio({
  audio,
  provider,
  durationSeconds,
  sourceLanguage
}: {
  audio: File;
  provider: ApiProvider;
  durationSeconds: string;
  sourceLanguage: TranscriptionLanguage;
}) {
  if (provider === "openai") {
    return await transcribeWithOpenAI(audio, durationSeconds, sourceLanguage);
  }

  return await transcribeWithGemini(audio, durationSeconds, sourceLanguage);
}

export async function transcribeJapaneseAudio({
  audio,
  provider,
  durationSeconds
}: {
  audio: File;
  provider: ApiProvider;
  durationSeconds: string;
}) {
  return transcribeAudio({ audio, provider, durationSeconds, sourceLanguage: "ja" });
}

async function transcribeWithGemini(
  audio: File,
  durationSeconds: string,
  sourceLanguage: TranscriptionLanguage
) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY または GOOGLE_API_KEY が設定されていません。");
  }

  const arrayBuffer = await audio.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  const response = await withOneRetryOnUnavailable(() =>
    ai.models.generateContent({
      model: getGeminiAudioModel(),
      contents: [
        {
          text: buildTranscriptionInstruction(sourceLanguage, durationSeconds)
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

  return response.text?.trim() ?? "";
}

async function transcribeWithOpenAI(
  audio: File,
  durationSeconds: string,
  sourceLanguage: TranscriptionLanguage
) {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error("OPENAI_API_KEY が設定されていません。");
  }

  const transcription = await openai.audio.transcriptions.create({
    model: getOpenAITranscribeModel(),
    file: audio,
    language: sourceLanguage,
    prompt: buildOpenAITranscriptionPrompt(sourceLanguage, durationSeconds)
  });

  return transcription.text ?? "";
}

function buildTranscriptionInstruction(sourceLanguage: TranscriptionLanguage, durationSeconds: string) {
  if (sourceLanguage === "en") {
    return `Transcribe the English speech exactly as English text. The audio duration is ${durationSeconds} seconds. If there is no clear English speech, or the audio is silence/noise only, return an empty string. Do not invent or infer lecture text. The topic is a dental lecture or dental Q&A. Preserve dental terms, numbers, units such as mm and Ncm, anatomical directions, product names, and procedure names. Return only the English transcript text.`;
  }

  return `Transcribe the Japanese speech exactly as Japanese text. The audio duration is ${durationSeconds} seconds. If there is no clear Japanese speech, or the audio is silence/noise only, return an empty string. Do not invent or infer lecture text. The topic is a dental lecture or dental Q&A. Preserve dental terms, numbers, units such as mm and Ncm, anatomical directions, product names, and procedure names. Return only the Japanese transcript text.`;
}

function buildOpenAITranscriptionPrompt(sourceLanguage: TranscriptionLanguage, durationSeconds: string) {
  const languageLabel = sourceLanguage === "en" ? "English" : "Japanese";
  return `${languageLabel} dental lecture, implant dentistry, oral surgery, prosthetics, guided surgery, maxilla, mandible, Ncm, mm. Audio duration: ${durationSeconds} seconds. If there is no clear speech, return an empty transcript. Do not invent content for silence or background noise.`;
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
