"use client";

import {
  AlertTriangle,
  BookOpen,
  Clipboard,
  FileText,
  Languages,
  Mic,
  MicOff,
  Play,
  Send,
  Square,
  Stethoscope
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRelevantGlossaryEntriesForText, loadCustomGlossary } from "@/lib/custom-glossary";
import { registerServiceWorker } from "@/lib/pwa";
import { findRiskItems } from "@/lib/risk";
import type {
  ApiProvider,
  DentalGlossaryEntry,
  Mode,
  RiskItem,
  SpeechLanguage,
  SpeechVoiceStyle,
  StylePreset
} from "@/lib/types";

const modeLabels: Record<Mode, string> = {
  lecture: "講演モード",
  qa: "Q&Aモード",
  script: "原稿モード"
};

const styleLabels: Record<StylePreset, string> = {
  professional: "専門家向け・講演調",
  business: "丁寧なビジネス調",
  concise: "短く簡潔",
  patient: "患者説明向け",
  handsOn: "ハンズオン指導向け"
};

const providerLabels: Record<ApiProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI"
};

const voiceStyleLabels: Record<SpeechVoiceStyle, string> = {
  standard: "Standard",
  calm: "Calm",
  lecture: "Lecture"
};

type TranslationResult = {
  english: string;
  chinese: string;
};

type ApiAvailability = Record<ApiProvider, boolean>;

type RecorderState = {
  audioContext: AudioContext;
  workletNode: AudioWorkletNode;
  source: MediaStreamAudioSourceNode;
  stream: MediaStream;
  chunks: Float32Array[];
  sampleRate: number;
};

type AudioStats = {
  durationSeconds: number;
  peak: number;
  rms: number;
  speechRatio: number;
};

type SpeechTarget = "english" | "chinese";

const lastResultStorageKey = "dental-lecture-translator:last-result";

const silenceThresholds = {
  minDuration: getPublicNumberEnv("NEXT_PUBLIC_SILENCE_MIN_DURATION", 0.6),
  peak: getPublicNumberEnv("NEXT_PUBLIC_SILENCE_PEAK", 0.025),
  rms: getPublicNumberEnv("NEXT_PUBLIC_SILENCE_RMS", 0.006),
  speechRatio: getPublicNumberEnv("NEXT_PUBLIC_SILENCE_SPEECH_RATIO", 0.01)
};

type SavedTranslationResult = {
  japanese?: unknown;
  english?: unknown;
  chinese?: unknown;
  provider?: unknown;
  mode?: unknown;
  style?: unknown;
};

export default function Home() {
  const [provider, setProvider] = useState<ApiProvider>("gemini");
  const [mode, setMode] = useState<Mode>("lecture");
  const [style, setStyle] = useState<StylePreset>("professional");
  const [voiceStyle, setVoiceStyle] = useState<SpeechVoiceStyle>("lecture");
  const [speechSpeed, setSpeechSpeed] = useState(1);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [japaneseText, setJapaneseText] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [chineseText, setChineseText] = useState("");
  const [lastTranslatedJapaneseText, setLastTranslatedJapaneseText] = useState("");
  const [apiAvailability, setApiAvailability] = useState<ApiAvailability | null>(null);
  const [glossary, setGlossary] = useState<DentalGlossaryEntry[]>([]);
  const [customGlossary, setCustomGlossary] = useState<DentalGlossaryEntry[]>([]);
  const [generatingSpeech, setGeneratingSpeech] = useState<SpeechTarget | null>(null);
  const [playingSpeech, setPlayingSpeech] = useState<SpeechTarget | null>(null);
  const recorderRef = useRef<RecorderState | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechCacheRef = useRef<Map<string, string>>(new Map());
  const activeRequestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    registerServiceWorker();
    restoreLastResult({
      setJapaneseText,
      setEnglishText,
      setChineseText,
      setLastTranslatedJapaneseText,
      setProvider,
      setMode,
      setStyle
    });
    setCustomGlossary(loadCustomGlossary());

    fetch("/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("API設定の確認に失敗しました。");
        return response.json();
      })
      .then((data: Partial<ApiAvailability>) => {
        setApiAvailability({
          gemini: Boolean(data.gemini),
          openai: Boolean(data.openai)
        });
      })
      .catch(() => {
        setApiAvailability(null);
      });

    fetch("/data/dental-glossary.json")
      .then((response) => {
        if (!response.ok) throw new Error("用語辞書を読み込めませんでした。");
        return response.json();
      })
      .then((data: DentalGlossaryEntry[]) => setGlossary(data))
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "用語辞書の読み込みに失敗しました。");
      });
  }, []);

  useEffect(() => {
    const speechCache = speechCacheRef.current;
    return () => {
      activeRequestControllerRef.current?.abort();
      const recorder = recorderRef.current;
      stopRecorder(recorder);
      if (recorder) {
        void recorder.audioContext.close();
      }
      recorderRef.current = null;
      audioRef.current?.pause();
      speechCache.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const effectiveGlossary = useMemo(
    () => [...glossary, ...customGlossary],
    [customGlossary, glossary]
  );

  const riskItems = useMemo<RiskItem[]>(
    () => findRiskItems(japaneseText, effectiveGlossary),
    [effectiveGlossary, japaneseText]
  );

  const startRequest = useCallback(() => {
    activeRequestControllerRef.current?.abort();
    const controller = new AbortController();
    activeRequestControllerRef.current = controller;
    return controller;
  }, []);

  const isActiveRequest = useCallback((controller: AbortController) => {
    return activeRequestControllerRef.current === controller && !controller.signal.aborted;
  }, []);

  const finishRequest = useCallback((controller: AbortController) => {
    if (activeRequestControllerRef.current === controller) {
      activeRequestControllerRef.current = null;
    }
  }, []);

  const translateText = useCallback(
    async (text: string) => {
      const controller = startRequest();
      setIsBusy(true);
      setError("");
      stopSpeech();
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            text,
            provider,
            mode,
            style,
            glossary: getRelevantGlossaryEntriesForText(text, customGlossary)
          })
        });

        const data = (await response.json()) as Partial<TranslationResult> & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "翻訳に失敗しました。");

        if (!isActiveRequest(controller)) return;
        setEnglishText(data.english ?? "");
        setChineseText(data.chinese ?? "");
        setLastTranslatedJapaneseText(text);
        localStorage.setItem(
          lastResultStorageKey,
          JSON.stringify({
            japanese: text,
            english: data.english ?? "",
            chinese: data.chinese ?? "",
            provider,
            mode,
            style,
            savedAt: new Date().toISOString()
          })
        );
      } catch (reason) {
        if (isAbortError(reason)) return;
        if (isActiveRequest(controller)) {
          setError(reason instanceof Error ? reason.message : "翻訳処理でエラーが発生しました。");
        }
      } finally {
        if (isActiveRequest(controller)) {
          setIsBusy(false);
        }
        finishRequest(controller);
      }
    },
    [customGlossary, finishRequest, isActiveRequest, mode, provider, startRequest, style]
  );

  const startRecording = async () => {
    setError("");
    setEnglishText("");
    setChineseText("");
    setLastTranslatedJapaneseText("");
    setIsPreparingRecording(true);
    stopSpeech();

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsPreparingRecording(false);
      setError("このブラウザではマイク録音を利用できません。");
      return;
    }

    if (!("AudioWorkletNode" in window)) {
      setIsPreparingRecording(false);
      setError("このブラウザではAudioWorkletによる録音を利用できません。別のブラウザでお試しください。");
      return;
    }

    let audioContext: AudioContext | null = null;
    let stream: MediaStream | null = null;

    try {
      audioContext = new AudioContext();
      if (!audioContext.audioWorklet) {
        throw new Error("AudioWorkletUnsupported");
      }

      await resumeAudioContext(audioContext);
      try {
        await audioContext.audioWorklet.addModule("/worklets/recorder-processor.js");
      } catch {
        throw new Error("RecorderWorkletLoadFailed");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      await resumeAudioContext(audioContext);
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "recorder-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 0
      });
      const chunks: Float32Array[] = [];

      workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        chunks.push(new Float32Array(event.data));
      };

      source.connect(workletNode);

      recorderRef.current = {
        audioContext,
        workletNode,
        source,
        stream,
        chunks,
        sampleRate: audioContext.sampleRate
      };
      audioContext = null;
      stream = null;
      setIsPreparingRecording(false);
      setIsRecording(true);
    } catch (reason) {
      stream?.getTracks().forEach((track) => track.stop());
      await audioContext?.close().catch(() => undefined);
      setIsPreparingRecording(false);
      setError(
        reason instanceof Error
          ? getRecordingStartErrorMessage(reason)
          : "マイクを開始できませんでした。"
      );
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    setIsBusy(true);
    setIsRecording(false);
    recorderRef.current = null;
    stopRecorder(recorder);
    await recorder.audioContext.close().catch(() => undefined);

    const samples = mergeAudioChunks(recorder.chunks);
    const stats = getAudioStats(samples, recorder.sampleRate);
    if (isSilentRecording(stats)) {
      setIsBusy(false);
      setError("音声が検出されませんでした。録音開始後に少し話してから停止してください。");
      return;
    }

    const audioBlob = encodeWav(samples, recorder.sampleRate);
    await transcribeRecording(audioBlob, stats.durationSeconds);
  };

  const transcribeRecording = async (audioBlob: Blob, durationSeconds: number) => {
    if (!audioBlob.size) {
      setIsBusy(false);
      setError("録音データが空でした。もう一度録音してください。");
      return;
    }

    const controller = startRequest();
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speech.wav");
      formData.append("provider", provider);
      formData.append("durationSeconds", durationSeconds.toFixed(2));

      const response = await fetch("/api/transcribe", {
        method: "POST",
        signal: controller.signal,
        body: formData
      });
      const data = (await response.json()) as { text?: string; error?: string };

      if (!response.ok) throw new Error(data.error ?? "文字起こしに失敗しました。");

      const text = data.text?.trim() ?? "";
      if (!isActiveRequest(controller)) return;
      if (!text) {
        setIsBusy(false);
        setError("音声が検出されませんでした。もう一度録音してください。");
        return;
      }

      setJapaneseText(text);
      await translateText(text);
    } catch (reason) {
      if (isAbortError(reason)) return;
      if (isActiveRequest(controller)) {
        setError(reason instanceof Error ? reason.message : "文字起こし処理でエラーが発生しました。");
      }
    } finally {
      if (isActiveRequest(controller)) {
        setIsBusy(false);
      }
      finishRequest(controller);
    }
  };

  const translateScript = async () => {
    if (!japaneseText.trim()) {
      setError("翻訳する日本語テキストを入力してください。");
      return;
    }
    await translateText(japaneseText.trim());
  };

  const isTranslationPossiblyStale = Boolean(
    (englishText || chineseText) &&
      lastTranslatedJapaneseText &&
      japaneseText.trim() !== lastTranslatedJapaneseText.trim()
  );
  const apiWarning = getApiWarning(provider, apiAvailability);

  const copyText = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  };

  const playSpeech = async (target: SpeechTarget, language: SpeechLanguage, text: string) => {
    if (!text.trim()) return;
    stopSpeech();
    setError("");
    setGeneratingSpeech(target);

    try {
      const cacheKey = JSON.stringify({
        provider,
        language,
        text,
        speed: speechSpeed,
        voiceStyle
      });
      let audioUrl = speechCacheRef.current.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch("/api/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            language,
            text,
            speed: speechSpeed,
            voiceStyle
          })
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "音声生成に失敗しました。");
        }

        audioUrl = URL.createObjectURL(await response.blob());
        speechCacheRef.current.set(cacheKey, audioUrl);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingSpeech(null);
      audio.onerror = () => {
        setPlayingSpeech(null);
        setError("音声の再生に失敗しました。");
      };
      setPlayingSpeech(target);
      await audio.play();
    } catch (reason) {
      setPlayingSpeech(null);
      setError(reason instanceof Error ? reason.message : "音声生成処理でエラーが発生しました。");
    } finally {
      setGeneratingSpeech(null);
    }
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingSpeech(null);
    setGeneratingSpeech(null);
  };

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="brandTitle">Dental Lecture Translator</h1>
            <p className="brandSub">歯科講演・教育・Q&A向け翻訳補助</p>
          </div>
        </div>
        <div className="topActions">
          <Link className="secondaryButton navButton" href="/glossary">
            <BookOpen size={18} />
            用語集
          </Link>
          <div className="statusPill">
            <span className={`statusDot ${isRecording ? "recording" : ""}`} />
            {isRecording ? "録音中" : isPreparingRecording ? "マイク確認中" : "準備完了"}
          </div>
        </div>
      </header>

      <div className="stack">
        {apiWarning ? <div className="apiWarningBox">{apiWarning}</div> : null}

        <section className="card panel">
          <div className="fieldGrid threeFields">
            <label className="field">
              <span className="label">API</span>
              <select
                className="select"
                value={provider}
                onChange={(event) => setProvider(event.target.value as ApiProvider)}
              >
                {Object.entries(providerLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">モード</span>
              <select
                className="select"
                value={mode}
                onChange={(event) => setMode(event.target.value as Mode)}
              >
                {Object.entries(modeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">翻訳スタイル</span>
              <select
                className="select"
                value={style}
                onChange={(event) => setStyle(event.target.value as StylePreset)}
              >
                {Object.entries(styleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="fieldGrid twoFields speechSettings">
            <label className="field">
              <span className="label">音声タイプ</span>
              <select
                className="select"
                value={voiceStyle}
                onChange={(event) => setVoiceStyle(event.target.value as SpeechVoiceStyle)}
              >
                {Object.entries(voiceStyleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">読み上げ速度</span>
              <select
                className="select"
                value={speechSpeed}
                onChange={(event) => setSpeechSpeed(Number(event.target.value))}
              >
                <option value={0.8}>0.8x</option>
                <option value={1}>1.0x</option>
                <option value={1.2}>1.2x</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card panel">
          <div className="controls">
            <button
              className={`primaryButton ${isRecording ? "active" : ""}`}
              type="button"
              onClick={startRecording}
              disabled={isRecording || isPreparingRecording || isBusy}
            >
              <Mic size={22} />
              {isPreparingRecording ? "マイク確認中" : "録音開始"}
            </button>
            <button
              className="secondaryButton"
              type="button"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              <MicOff size={22} />
              録音停止
            </button>
          </div>
          <label className="field" style={{ marginTop: 12 }}>
            <span className="label">日本語原稿入力</span>
            <textarea
              className="textArea"
              value={japaneseText}
              onChange={(event) => setJapaneseText(event.target.value)}
              placeholder="原稿モードではここに日本語原稿を貼り付けて翻訳できます。音声入力後の文字起こしもここに表示されます。"
            />
          </label>
          <div className="actionRow">
            <button
              className="secondaryButton"
              type="button"
              onClick={translateScript}
              disabled={isBusy || !japaneseText.trim()}
            >
              <Send size={20} />
              翻訳する
            </button>
          </div>
          {isBusy ? (
            <p className="loadingLine" aria-live="polite">
              <span className="spinner" />
              処理中です
            </p>
          ) : null}
        </section>

        {error ? <div className="errorBox">{error}</div> : null}

        <ResultCard title="日本語原文" icon={<FileText size={18} />} text={japaneseText} onCopy={copyText} />
        <ResultCard
          title="English"
          icon={<Languages size={18} />}
          text={englishText}
          onCopy={copyText}
          isPossiblyStale={isTranslationPossiblyStale}
          speech={{
            target: "english",
            language: "en",
            generatingSpeech,
            playingSpeech,
            onPlay: playSpeech,
            onStop: stopSpeech
          }}
        />
        <ResultCard
          title="简体中文"
          icon={<Languages size={18} />}
          text={chineseText}
          onCopy={copyText}
          isPossiblyStale={isTranslationPossiblyStale}
          speech={{
            target: "chinese",
            language: "zh",
            generatingSpeech,
            playingSpeech,
            onPlay: playSpeech,
            onStop: stopSpeech
          }}
        />

        <section className="card panel riskPanel">
          <h2 className="riskHeader">
            <AlertTriangle size={18} />
            翻訳後に確認する項目
          </h2>
          {riskItems.length ? (
            <ul className="riskList">
              {riskItems.map((item) => (
                <li className="riskItem" key={`${item.kind}-${item.term}-${item.en}`}>
                  <span className="riskTerm">{item.term}</span>
                  <span className="riskMeta">
                    {item.en ? `${item.en}` : item.kind}
                    {item.zh ? ` / ${item.zh}` : ""}
                    {item.note ? ` - ${item.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="placeholder">数字、単位、左右、上下顎、術式、禁忌・適応など、翻訳後に確認したい語句を表示します。</p>
          )}
        </section>

      </div>
    </main>
  );
}

function ResultCard({
  title,
  icon,
  text,
  onCopy,
  isPossiblyStale,
  speech
}: {
  title: string;
  icon: React.ReactNode;
  text: string;
  onCopy: (text: string) => Promise<void>;
  isPossiblyStale?: boolean;
  speech?: {
    target: SpeechTarget;
    language: SpeechLanguage;
    generatingSpeech: SpeechTarget | null;
    playingSpeech: SpeechTarget | null;
    onPlay: (target: SpeechTarget, language: SpeechLanguage, text: string) => Promise<void>;
    onStop: () => void;
  };
}) {
  const isGenerating = Boolean(speech && speech.generatingSpeech === speech.target);
  const isPlaying = Boolean(speech && speech.playingSpeech === speech.target);

  return (
    <section className="card resultCard">
      <div className="resultHeader">
        <div className="resultTitleGroup">
          <h2 className="resultTitle">
            {icon}
            {title}
          </h2>
          {isPossiblyStale ? (
            <span className="staleBadge">最新の入力と一致していない可能性があります</span>
          ) : null}
        </div>
        <div className="resultActions">
          {speech ? (
            <>
              <button
                className="copyButton"
                type="button"
                onClick={() => speech.onPlay(speech.target, speech.language, text)}
                disabled={!text || isGenerating}
                title="読み上げ"
              >
                <Play size={18} />
              </button>
              <button
                className="copyButton"
                type="button"
                onClick={speech.onStop}
                disabled={!isPlaying && !isGenerating}
                title="停止"
              >
                <Square size={18} />
              </button>
            </>
          ) : null}
          <button className="copyButton" type="button" onClick={() => onCopy(text)} disabled={!text} title="コピー">
            <Clipboard size={18} />
          </button>
        </div>
      </div>
      <div className="resultBody">
        {isGenerating ? <span className="placeholder">音声生成中です。</span> : text || <span className="placeholder">まだテキストはありません。</span>}
      </div>
    </section>
  );
}

function getMicrophoneErrorMessage(error: Error) {
  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return "マイクの使用が許可されていません。ブラウザのアドレスバー付近の権限設定でマイクを許可してください。";
  }

  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return "マイクが見つかりません。PCまたはブラウザの入力デバイス設定を確認してください。";
  }

  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "マイクを開始できませんでした。他のアプリがマイクを使用していないか確認してください。";
  }

  return `マイクを開始できませんでした: ${error.message}`;
}

function getRecordingStartErrorMessage(error: Error) {
  if (error.message === "AudioWorkletUnsupported") {
    return "このブラウザではAudioWorkletによる録音を利用できません。別のブラウザでお試しください。";
  }

  if (error.message === "RecorderWorkletLoadFailed" || error.name === "NotSupportedError") {
    return "録音機能の初期化に失敗しました。ページを再読み込みしてから、もう一度録音を開始してください。";
  }

  return getMicrophoneErrorMessage(error);
}

async function resumeAudioContext(audioContext: AudioContext) {
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

function stopRecorder(recorder: RecorderState | null) {
  if (!recorder) return;

  recorder.workletNode.port.onmessage = null;
  recorder.workletNode.disconnect();
  recorder.source.disconnect();
  recorder.stream.getTracks().forEach((track) => track.stop());
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function restoreLastResult({
  setJapaneseText,
  setEnglishText,
  setChineseText,
  setLastTranslatedJapaneseText,
  setProvider,
  setMode,
  setStyle
}: {
  setJapaneseText: (value: string) => void;
  setEnglishText: (value: string) => void;
  setChineseText: (value: string) => void;
  setLastTranslatedJapaneseText: (value: string) => void;
  setProvider: (value: ApiProvider) => void;
  setMode: (value: Mode) => void;
  setStyle: (value: StylePreset) => void;
}) {
  try {
    const saved = localStorage.getItem(lastResultStorageKey);
    if (!saved) return;

    const parsed = JSON.parse(saved) as SavedTranslationResult;

    if (typeof parsed.japanese === "string") {
      setJapaneseText(parsed.japanese);
      setLastTranslatedJapaneseText(parsed.japanese);
    }
    if (typeof parsed.english === "string") setEnglishText(parsed.english);
    if (typeof parsed.chinese === "string") setChineseText(parsed.chinese);
    if (isApiProvider(parsed.provider)) setProvider(parsed.provider);
    if (isMode(parsed.mode)) setMode(parsed.mode);
    if (isStylePreset(parsed.style)) setStyle(parsed.style);
  } catch {
    // Ignore corrupted localStorage data; it should not block first load.
  }
}

function isApiProvider(value: unknown): value is ApiProvider {
  return value === "gemini" || value === "openai";
}

function isMode(value: unknown): value is Mode {
  return value === "lecture" || value === "qa" || value === "script";
}

function isStylePreset(value: unknown): value is StylePreset {
  return (
    value === "professional" ||
    value === "business" ||
    value === "concise" ||
    value === "patient" ||
    value === "handsOn"
  );
}

function getApiWarning(provider: ApiProvider, apiAvailability: ApiAvailability | null) {
  if (!apiAvailability || apiAvailability[provider]) return "";

  const keyName = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY";
  const providerName = providerLabels[provider];
  return `${providerName} のAPIキーが未設定です。.env.local の ${keyName} を確認してください。キー設定後はアプリを再起動または再読み込みしてください。`;
}

function getAudioStats(samples: Float32Array, sampleRate: number): AudioStats {
  if (!samples.length) {
    return { durationSeconds: 0, peak: 0, rms: 0, speechRatio: 0 };
  }

  let sumSquares = 0;
  let peak = 0;
  let speechLikeSamples = 0;

  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.abs(samples[index]);
    sumSquares += value * value;
    peak = Math.max(peak, value);
    if (value > 0.018) speechLikeSamples += 1;
  }

  return {
    durationSeconds: samples.length / sampleRate,
    peak,
    rms: Math.sqrt(sumSquares / samples.length),
    speechRatio: speechLikeSamples / samples.length
  };
}

function isSilentRecording(stats: AudioStats) {
  if (stats.durationSeconds < silenceThresholds.minDuration) return true;
  if (stats.peak < silenceThresholds.peak) return true;
  return stats.rms < silenceThresholds.rms && stats.speechRatio < silenceThresholds.speechRatio;
}

function getPublicNumberEnv(key: string, fallback: number) {
  const value = process.env[key];
  if (value === undefined || value.trim() === "") return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPcm(view, 44, samples);
  return new Blob([view], { type: "audio/wav" });
}

function mergeAudioChunks(chunks: Float32Array[]) {
  const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
  const result = new Float32Array(length);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

function floatTo16BitPcm(view: DataView, offset: number, input: Float32Array) {
  for (let index = 0; index < input.length; index += 1, offset += 2) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}
