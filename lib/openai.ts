import OpenAI from "openai";

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export function getOpenAITranscribeModel() {
  return process.env.OPENAI_TRANSCRIBE_MODEL ?? "gpt-4o-mini-transcribe";
}

export function getOpenAITranslationModel() {
  return process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4.1-mini";
}

export function getOpenAITtsModel() {
  return process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
}
