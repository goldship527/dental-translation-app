import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export function getGeminiAudioModel() {
  return process.env.GEMINI_AUDIO_MODEL ?? "gemini-2.5-flash";
}

export function getGeminiTranslationModel() {
  return process.env.GEMINI_TRANSLATION_MODEL ?? "gemini-2.5-flash";
}

export function getGeminiTtsModel() {
  return process.env.GEMINI_TTS_MODEL ?? "gemini-3.1-flash-tts-preview";
}
