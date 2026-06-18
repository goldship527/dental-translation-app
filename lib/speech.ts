import { wrapPcmAsWav } from "@/lib/audio";
import { getGeminiClient, getGeminiTtsModel } from "@/lib/gemini";
import { getOpenAIClient, getOpenAITtsModel } from "@/lib/openai";
import type { ApiProvider, SpeechLanguage, SpeechVoiceStyle } from "@/lib/types";

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

export type SpeechAudio = {
  buffer: Buffer;
  contentType: string;
  extension: "mp3" | "wav";
};

export async function createSpeechAudio({
  provider,
  text,
  language,
  speed,
  voiceStyle
}: {
  provider: ApiProvider;
  text: string;
  language: SpeechLanguage;
  speed: number;
  voiceStyle: SpeechVoiceStyle;
}): Promise<SpeechAudio> {
  const normalizedSpeed = clampSpeed(speed);

  if (provider === "openai") {
    return await createOpenAISpeech({ text, language, speed: normalizedSpeed, voiceStyle });
  }

  return await createGeminiSpeech({ text, language, speed: normalizedSpeed, voiceStyle });
}

export function clampSpeechSpeed(speed: number) {
  return clampSpeed(speed);
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
    throw new Error("OPENAI_API_KEY が設定されていません。");
  }

  const response = await openai.audio.speech.create({
    model: getOpenAITtsModel(),
    voice: openAiVoices[voiceStyle],
    input: text,
    response_format: "mp3",
    speed,
    instructions: buildSpeechInstruction(language, voiceStyle, speed)
  });

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: "audio/mpeg",
    extension: "mp3" as const
  };
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
    throw new Error("GEMINI_API_KEY または GOOGLE_API_KEY が設定されていません。");
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

  return {
    buffer: wrapPcmAsWav(Buffer.from(base64Audio, "base64")),
    contentType: "audio/wav",
    extension: "wav" as const
  };
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
