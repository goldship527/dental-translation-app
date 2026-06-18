"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  FileVideo,
  HardDrive,
  Monitor,
  PackageCheck,
  Terminal,
  Upload,
  Video,
  Volume2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getRelevantGlossaryEntriesForText, loadCustomGlossary } from "@/lib/custom-glossary";
import type { ApiProvider, DentalGlossaryEntry } from "@/lib/types";

type SelectedVideo = {
  file: File;
  objectUrl: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
};

type FfmpegCheck = {
  ready: boolean;
  ffmpeg: {
    available: boolean;
    version?: string;
    error?: string;
  };
  ffprobe: {
    available: boolean;
    version?: string;
    error?: string;
  };
};

type ExtractedAudio = {
  jobId: string;
  sourceFileName: string;
  audioFileName: string;
  sourcePath: string;
  audioPath: string;
};

type VideoTranscript = {
  text: string;
  durationSeconds: string;
};

type VideoTranslation = {
  english: string;
};

type VideoNarration = {
  fileName: string;
  filePath: string;
  contentType: string;
  audioUrl: string;
};

type VideoSubtitles = {
  fileName: string;
  filePath: string;
  srt: string;
  subtitleUrl: string;
};

type RenderedVideo = {
  fileName: string;
  filePath: string;
  videoUrl: string;
};

type PackageSubtitleMode = "sidecar" | "burned";

type DistributionPackage = {
  packageDir: string;
  zipUrl: string;
  files: Array<{
    label: string;
    fileName: string;
    filePath: string;
  }>;
};

const providerLabels: Record<ApiProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI"
};

const maxVideoSizeBytes = 1024 * 1024 * 1024;

export default function VideoLocalizationPage() {
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [provider, setProvider] = useState<ApiProvider>("gemini");
  const [ffmpegCheck, setFfmpegCheck] = useState<FfmpegCheck | null>(null);
  const [isCheckingFfmpeg, setIsCheckingFfmpeg] = useState(false);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const [isRenderingSubtitledVideo, setIsRenderingSubtitledVideo] = useState(false);
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);
  const [extractedAudio, setExtractedAudio] = useState<ExtractedAudio | null>(null);
  const [videoTranscript, setVideoTranscript] = useState<VideoTranscript | null>(null);
  const [videoTranslation, setVideoTranslation] = useState<VideoTranslation | null>(null);
  const [videoSubtitles, setVideoSubtitles] = useState<VideoSubtitles | null>(null);
  const [videoNarration, setVideoNarration] = useState<VideoNarration | null>(null);
  const [renderedVideo, setRenderedVideo] = useState<RenderedVideo | null>(null);
  const [subtitledVideo, setSubtitledVideo] = useState<RenderedVideo | null>(null);
  const [distributionPackage, setDistributionPackage] = useState<DistributionPackage | null>(null);
  const [packageSubtitleMode, setPackageSubtitleMode] = useState<PackageSubtitleMode>("sidecar");
  const [customGlossary, setCustomGlossary] = useState<DentalGlossaryEntry[]>([]);
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedObjectUrl = selectedVideo?.objectUrl;

  useEffect(() => {
    void checkFfmpeg();
    setCustomGlossary(loadCustomGlossary());
  }, []);

  useEffect(() => {
    return () => {
      if (selectedObjectUrl) URL.revokeObjectURL(selectedObjectUrl);
    };
  }, [selectedObjectUrl]);

  const fileSummary = useMemo(() => {
    if (!selectedVideo) return null;
    return [
      {
        label: "ファイル名",
        value: selectedVideo.file.name,
        icon: <FileVideo size={18} />
      },
      {
        label: "容量",
        value: formatBytes(selectedVideo.file.size),
        icon: <HardDrive size={18} />
      },
      {
        label: "長さ",
        value:
          selectedVideo.durationSeconds === null
            ? "読み込み中"
            : formatDuration(selectedVideo.durationSeconds),
        icon: <Clock size={18} />
      },
      {
        label: "解像度",
        value:
          selectedVideo.width && selectedVideo.height
            ? `${selectedVideo.width} x ${selectedVideo.height}`
            : "読み込み中",
        icon: <Monitor size={18} />
      }
    ];
  }, [selectedVideo]);

  const selectVideo = (file: File | undefined) => {
    setNotice("");
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const looksLikeMp4 = file.type === "video/mp4" || lowerName.endsWith(".mp4");
    if (!looksLikeMp4) {
      setNotice("Keynoteで書き出したMP4ファイルを選択してください。");
      resetFileInput();
      return;
    }

    if (file.size > maxVideoSizeBytes) {
      setNotice("1GBを超える動画は、まず短い講演動画で検証してください。");
      resetFileInput();
      return;
    }

    setSelectedVideo((current) => {
      if (current) URL.revokeObjectURL(current.objectUrl);
      return {
        file,
        objectUrl: URL.createObjectURL(file),
        durationSeconds: null,
        width: null,
        height: null
      };
    });
    setExtractedAudio(null);
    setVideoTranscript(null);
    setVideoTranslation(null);
    setVideoSubtitles(null);
    setVideoNarration(null);
    setRenderedVideo(null);
    setSubtitledVideo(null);
    setDistributionPackage(null);
  };

  const clearVideo = () => {
    setSelectedVideo((current) => {
      if (current) URL.revokeObjectURL(current.objectUrl);
      return null;
    });
    setNotice("");
    setExtractedAudio(null);
    setVideoTranscript(null);
    setVideoTranslation(null);
    setVideoSubtitles(null);
    setVideoNarration(null);
    setRenderedVideo(null);
    setSubtitledVideo(null);
    setDistributionPackage(null);
    resetFileInput();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateVideoMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setSelectedVideo((current) => {
      if (!current) return current;
      return {
        ...current,
        durationSeconds: Number.isFinite(video.duration) ? video.duration : null,
        width: video.videoWidth || null,
        height: video.videoHeight || null
      };
    });
  };

  const checkFfmpeg = async () => {
    setIsCheckingFfmpeg(true);
    try {
      const response = await fetch("/api/video/ffmpeg-check");
      const data = (await response.json()) as FfmpegCheck;
      if (!response.ok) throw new Error("ffmpegの確認に失敗しました。");
      setFfmpegCheck(data);
    } catch {
      setFfmpegCheck(null);
    } finally {
      setIsCheckingFfmpeg(false);
    }
  };

  const extractAudio = async () => {
    if (!selectedVideo) return;
    setNotice("");
    setExtractedAudio(null);
    setIsExtractingAudio(true);
    try {
      const formData = new FormData();
      formData.append("video", selectedVideo.file);
      const response = await fetch("/api/video/extract-audio", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as Partial<ExtractedAudio> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "音声抽出に失敗しました。");
      setExtractedAudio({
        jobId: data.jobId ?? "",
        sourceFileName: data.sourceFileName ?? "",
        audioFileName: data.audioFileName ?? "",
        sourcePath: data.sourcePath ?? "",
        audioPath: data.audioPath ?? ""
      });
      setVideoTranscript(null);
      setVideoTranslation(null);
      setVideoSubtitles(null);
      setVideoNarration(null);
      setRenderedVideo(null);
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice("WAV音声を抽出しました。次はこの音声を文字起こしへ接続します。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "音声抽出でエラーが発生しました。");
    } finally {
      setIsExtractingAudio(false);
    }
  };

  const transcribeExtractedAudio = async () => {
    if (!extractedAudio) return;
    setNotice("");
    setIsTranscribing(true);
    try {
      const response = await fetch("/api/video/transcribe-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio.jobId,
          audioFileName: extractedAudio.audioFileName,
          provider
        })
      });
      const data = (await response.json()) as { text?: string; durationSeconds?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "文字起こしに失敗しました。");
      setVideoTranscript({
        text: data.text ?? "",
        durationSeconds: data.durationSeconds ?? "unknown"
      });
      setVideoTranslation(null);
      setVideoSubtitles(null);
      setVideoNarration(null);
      setRenderedVideo(null);
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice(data.text?.trim() ? "日本語音声を全文文字起こししました。" : "明瞭な日本語音声が検出されませんでした。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "文字起こしでエラーが発生しました。");
    } finally {
      setIsTranscribing(false);
    }
  };

  const translateTranscript = async () => {
    const text = videoTranscript?.text.trim() ?? "";
    if (!text) {
      setNotice("英訳する日本語文字起こしがありません。");
      return;
    }

    setNotice("");
    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          provider,
          mode: "script",
          style: "professional",
          glossary: getRelevantGlossaryEntriesForText(text, customGlossary)
        })
      });
      const data = (await response.json()) as { english?: string; error?: string };
      if (!response.ok) throw new Error(data.error ?? "英訳に失敗しました。");
      setVideoTranslation({
        english: data.english ?? ""
      });
      setVideoSubtitles(null);
      setVideoNarration(null);
      setRenderedVideo(null);
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice("全文を英訳しました。内容を確認・修正してください。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "英訳でエラーが発生しました。");
    } finally {
      setIsTranslating(false);
    }
  };

  const generateSubtitles = async () => {
    const text = videoTranslation?.english.trim() ?? "";
    if (!extractedAudio?.jobId) {
      setNotice("先にMP4から音声を抽出してください。");
      return;
    }
    if (!text) {
      setNotice("字幕にする英訳原稿がありません。");
      return;
    }

    setNotice("");
    setVideoSubtitles(null);
    setIsGeneratingSubtitles(true);
    try {
      const response = await fetch("/api/video/generate-subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio.jobId,
          text,
          durationSeconds: videoTranscript?.durationSeconds
        })
      });
      const data = (await response.json()) as Partial<VideoSubtitles> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "英語字幕SRT生成に失敗しました。");
      setVideoSubtitles({
        fileName: data.fileName ?? "",
        filePath: data.filePath ?? "",
        srt: data.srt ?? "",
        subtitleUrl: data.subtitleUrl ?? ""
      });
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice("英語字幕SRTを生成しました。配布用ファイルとして保存できます。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "英語字幕SRT生成でエラーが発生しました。");
    } finally {
      setIsGeneratingSubtitles(false);
    }
  };

  const generateNarration = async () => {
    const text = videoTranslation?.english.trim() ?? "";
    if (!extractedAudio?.jobId) {
      setNotice("先にMP4から音声を抽出してください。");
      return;
    }
    if (!text) {
      setNotice("ナレーションにする英訳原稿がありません。");
      return;
    }

    setNotice("");
    setVideoNarration(null);
    setIsGeneratingNarration(true);
    try {
      const response = await fetch("/api/video/generate-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio.jobId,
          provider,
          text
        })
      });
      const data = (await response.json()) as Partial<VideoNarration> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "英語ナレーション生成に失敗しました。");
      setVideoNarration({
        fileName: data.fileName ?? "",
        filePath: data.filePath ?? "",
        contentType: data.contentType ?? "",
        audioUrl: data.audioUrl ?? ""
      });
      setRenderedVideo(null);
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice("標準TTSで英語ナレーションを生成しました。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "英語ナレーション生成でエラーが発生しました。");
    } finally {
      setIsGeneratingNarration(false);
    }
  };

  const renderEnglishVersion = async () => {
    if (!extractedAudio || !videoNarration) {
      setNotice("元動画と英語ナレーション音声が必要です。");
      return;
    }

    setNotice("");
    setRenderedVideo(null);
    setIsRenderingVideo(true);
    try {
      const response = await fetch("/api/video/render-english-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio.jobId,
          sourceFileName: extractedAudio.sourceFileName,
          narrationFileName: videoNarration.fileName
        })
      });
      const data = (await response.json()) as Partial<RenderedVideo> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "英語版MP4を書き出せませんでした。");
      setRenderedVideo({
        fileName: data.fileName ?? "",
        filePath: data.filePath ?? "",
        videoUrl: data.videoUrl ?? ""
      });
      setSubtitledVideo(null);
      setDistributionPackage(null);
      setNotice("英語ナレーション音声で元動画の音声を完全に差し替えたMP4を書き出しました。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "英語版MP4の書き出しでエラーが発生しました。");
    } finally {
      setIsRenderingVideo(false);
    }
  };

  const renderSubtitledVersion = async () => {
    if (!renderedVideo || !videoSubtitles) {
      setNotice("字幕焼き込みには英語版MP4と英語字幕SRTが必要です。");
      return;
    }

    setNotice("");
    setSubtitledVideo(null);
    setIsRenderingSubtitledVideo(true);
    try {
      const response = await fetch("/api/video/render-subtitled-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio?.jobId,
          renderedVideoFileName: renderedVideo.fileName,
          subtitleFileName: videoSubtitles.fileName
        })
      });
      const data = (await response.json()) as Partial<RenderedVideo> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "字幕焼き込み版MP4を書き出せませんでした。");
      setSubtitledVideo({
        fileName: data.fileName ?? "",
        filePath: data.filePath ?? "",
        videoUrl: data.videoUrl ?? ""
      });
      setPackageSubtitleMode("burned");
      setDistributionPackage(null);
      setNotice("字幕を焼き込んだ英語版MP4を書き出しました。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "字幕焼き込み版MP4の書き出しでエラーが発生しました。");
    } finally {
      setIsRenderingSubtitledVideo(false);
    }
  };

  const createPackage = async () => {
    const transcriptText = videoTranscript?.text.trim() ?? "";
    const englishText = videoTranslation?.english.trim() ?? "";
    const packageVideo = packageSubtitleMode === "burned" ? subtitledVideo : renderedVideo;
    if (!extractedAudio || !packageVideo) {
      setNotice("先に英語版MP4を書き出してください。");
      return;
    }
    if (!transcriptText || !englishText) {
      setNotice("文字起こしと英訳原稿が必要です。");
      return;
    }

    setNotice("");
    setDistributionPackage(null);
    setIsCreatingPackage(true);
    try {
      const response = await fetch("/api/video/create-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: extractedAudio.jobId,
          sourceFileName: extractedAudio.sourceFileName,
          renderedVideoFileName: packageVideo.fileName,
          subtitleFileName: packageSubtitleMode === "sidecar" ? videoSubtitles?.fileName : undefined,
          burnedInSubtitles: packageSubtitleMode === "burned",
          transcriptText,
          englishText
        })
      });
      const data = (await response.json()) as Partial<DistributionPackage> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "配布用パッケージを作成できませんでした。");
      setDistributionPackage({
        packageDir: data.packageDir ?? "",
        zipUrl: `/api/video/package-zip?jobId=${encodeURIComponent(extractedAudio.jobId)}`,
        files: data.files ?? []
      });
      setNotice("配布用パッケージを作成しました。");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "配布用パッケージ作成でエラーが発生しました。");
    } finally {
      setIsCreatingPackage(false);
    }
  };

  return (
    <main className="appShell">
      <header className="topBar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">
            <Video size={24} />
          </div>
          <div>
            <h1 className="brandTitle">動画ローカライズ</h1>
            <p className="brandSub">Keynote録画MP4から英語版動画を作成</p>
          </div>
        </div>
        <Link className="secondaryButton navButton" href="/">
          <ArrowLeft size={18} />
          戻る
        </Link>
      </header>

      <div className="stack">
        <section className="card panel videoIntroPanel">
          <div>
            <h2 className="sectionTitle">
              <PackageCheck size={18} />
              配布用パッケージの入口
            </h2>
            <p className="sectionSub">
              元の日本語MP4は上書きせず、英語版動画は別ファイルとして作成します。初期MVPでは短い検証動画から進めます。
            </p>
          </div>
          <div className="videoStepGrid" aria-label="動画ローカライズの流れ">
            {["MP4選択", "音声抽出", "英訳確認", "動画書き出し"].map((step, index) => (
              <div className={`videoStep ${index <= (videoNarration ? 3 : videoTranslation ? 2 : videoTranscript ? 2 : extractedAudio ? 1 : 0) ? "active" : ""}`} key={step}>
                <span className="videoStepNumber">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card panel videoUploadPanel">
          <input
            ref={fileInputRef}
            className="hiddenInput"
            type="file"
            accept="video/mp4,.mp4"
            onChange={(event) => selectVideo(event.target.files?.[0])}
          />

          <button
            className="videoDropButton"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={26} />
            <span className="videoDropTitle">Keynote録画MP4を選択</span>
            <span className="videoDropSub">動画はこの画面で確認するだけで、まだAPIへ送信しません。</span>
          </button>

          {notice ? <p className="glossaryNotice">{notice}</p> : null}
        </section>

        <section className="card panel videoToolPanel">
          <div>
            <h2 className="sectionTitle">
              <Terminal size={18} />
              ffmpeg
            </h2>
            <p className="sectionSub">Macローカルで音声抽出と動画合成に使います。</p>
          </div>
          <div className={`videoToolStatus ${ffmpegCheck?.ready ? "ready" : ""}`}>
            {isCheckingFfmpeg
              ? "確認中"
              : ffmpegCheck?.ready
                ? "利用できます"
                : "未確認または利用できません"}
          </div>
          {ffmpegCheck ? (
            <div className="videoCommandGrid">
              <CommandStatus label="ffmpeg" available={ffmpegCheck.ffmpeg.available} version={ffmpegCheck.ffmpeg.version} />
              <CommandStatus label="ffprobe" available={ffmpegCheck.ffprobe.available} version={ffmpegCheck.ffprobe.version} />
            </div>
          ) : null}
          <button className="secondaryButton compactButton" type="button" onClick={checkFfmpeg} disabled={isCheckingFfmpeg}>
            再確認
          </button>
        </section>

        <section className="card panel">
          <label className="field">
            <span className="label">文字起こしAPI</span>
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
        </section>

        {selectedVideo && fileSummary ? (
          <>
            <section className="card panel">
              <h2 className="sectionTitle">
                <CheckCircle2 size={18} />
                選択中の動画
              </h2>
              <dl className="videoMetaGrid">
                {fileSummary.map((item) => (
                  <div className="videoMetaItem" key={item.label}>
                    <dt>
                      {item.icon}
                      {item.label}
                    </dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="actionRow">
                <button className="secondaryButton" type="button" onClick={clearVideo}>
                  別のMP4を選択
                </button>
                <button
                  className="primaryButton"
                  type="button"
                  onClick={extractAudio}
                  disabled={isExtractingAudio || !ffmpegCheck?.ready}
                >
                  {isExtractingAudio ? "抽出中" : "音声を抽出"}
                </button>
              </div>
            </section>

            {extractedAudio ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <CheckCircle2 size={18} />
                  抽出したWAV
                </h2>
                <dl className="videoPathList">
                  <div>
                    <dt>元動画コピー</dt>
                    <dd>{extractedAudio.sourcePath}</dd>
                  </div>
                  <div>
                    <dt>抽出音声</dt>
                    <dd>{extractedAudio.audioPath}</dd>
                  </div>
                </dl>
                <div className="actionRow">
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={transcribeExtractedAudio}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? "文字起こし中" : "全文を文字起こし"}
                  </button>
                </div>
              </section>
            ) : null}

            {videoTranscript ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <FileText size={18} />
                  日本語文字起こし
                </h2>
                <p className="sectionSub">
                  まずは全文テキストとして表示します。次の段階でスライド単位・字幕単位に分割します。
                </p>
                <label className="field speechSettings">
                  <span className="label">全文</span>
                  <textarea
                    className="textArea transcriptArea"
                    value={videoTranscript.text}
                    onChange={(event) => {
                      setVideoTranscript((current) =>
                        current ? { ...current, text: event.target.value } : current
                      );
                      setVideoTranslation(null);
                      setVideoSubtitles(null);
                      setVideoNarration(null);
                      setRenderedVideo(null);
                      setSubtitledVideo(null);
                      setDistributionPackage(null);
                    }}
                  />
                </label>
                <p className="historyCount">
                  音声長: {videoTranscript.durationSeconds === "unknown" ? "不明" : formatDuration(Number(videoTranscript.durationSeconds))}
                </p>
                <div className="actionRow">
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={translateTranscript}
                    disabled={isTranslating || !videoTranscript.text.trim()}
                  >
                    {isTranslating ? "英訳中" : "全文を英訳"}
                  </button>
                </div>
              </section>
            ) : null}

            {videoTranslation ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <FileText size={18} />
                  英訳原稿
                </h2>
                <p className="sectionSub">
                  まずは全文英訳として表示します。次の段階で字幕単位に分割し、英語ナレーションへ接続します。
                </p>
                <label className="field speechSettings">
                  <span className="label">English</span>
                  <textarea
                    className="textArea transcriptArea"
                    value={videoTranslation.english}
                    onChange={(event) => {
                      setVideoTranslation((current) =>
                        current ? { ...current, english: event.target.value } : current
                      );
                      setVideoSubtitles(null);
                      setVideoNarration(null);
                      setRenderedVideo(null);
                      setSubtitledVideo(null);
                      setDistributionPackage(null);
                    }}
                  />
                </label>
                <div className="actionRow">
                  <button
                    className="secondaryButton"
                    type="button"
                    onClick={generateSubtitles}
                    disabled={isGeneratingSubtitles || !videoTranslation.english.trim()}
                  >
                    {isGeneratingSubtitles ? "生成中" : "英語字幕SRT生成"}
                  </button>
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={generateNarration}
                    disabled={isGeneratingNarration || !videoTranslation.english.trim()}
                  >
                    {isGeneratingNarration ? "生成中" : "英語ナレーション生成"}
                  </button>
                </div>
              </section>
            ) : null}

            {videoSubtitles ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <FileText size={18} />
                  英語字幕SRT
                </h2>
                <p className="sectionSub">
                  英訳原稿を文ごとに分割し、動画の長さに合わせて初期タイミングを割り当てた字幕ファイルです。
                </p>
                <label className="field speechSettings">
                  <span className="label">SRT</span>
                  <textarea
                    className="textArea subtitleArea"
                    value={videoSubtitles.srt}
                    readOnly
                  />
                </label>
                <dl className="videoPathList">
                  <div>
                    <dt>字幕ファイル</dt>
                    <dd>{videoSubtitles.filePath}</dd>
                  </div>
                </dl>
                <div className="actionRow">
                  <a className="secondaryButton" href={videoSubtitles.subtitleUrl}>
                    SRTを開く
                  </a>
                </div>
              </section>
            ) : null}

            {videoNarration ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <Volume2 size={18} />
                  英語ナレーション
                </h2>
                <p className="sectionSub">
                  標準TTSで生成した1本の英語音声です。次の段階で元動画の日本語音声と完全に差し替えます。
                </p>
                <audio className="narrationPlayer" src={videoNarration.audioUrl} controls />
                <dl className="videoPathList">
                  <div>
                    <dt>ナレーション音声</dt>
                    <dd>{videoNarration.filePath}</dd>
                  </div>
                  <div>
                    <dt>形式</dt>
                    <dd>{videoNarration.contentType}</dd>
                  </div>
                </dl>
                <div className="actionRow">
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={renderEnglishVersion}
                    disabled={isRenderingVideo || !ffmpegCheck?.ready}
                  >
                    {isRenderingVideo ? "書き出し中" : "英語版MP4を書き出し"}
                  </button>
                </div>
              </section>
            ) : null}

            {renderedVideo ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <Video size={18} />
                  英語版MP4
                </h2>
                <p className="sectionSub">
                  元動画の映像に英語ナレーション音声だけを合わせたMP4です。日本語音声はマップしていません。
                </p>
                <video className="videoPreview renderedVideoPreview" src={renderedVideo.videoUrl} controls />
                <dl className="videoPathList">
                  <div>
                    <dt>英語版MP4</dt>
                    <dd>{renderedVideo.filePath}</dd>
                  </div>
                </dl>
                <div className="actionRow">
                  {videoSubtitles ? (
                    <button
                      className="secondaryButton"
                      type="button"
                      onClick={renderSubtitledVersion}
                      disabled={isRenderingSubtitledVideo || !ffmpegCheck?.ready}
                    >
                      {isRenderingSubtitledVideo ? "焼き込み中" : "字幕焼き込みMP4作成"}
                    </button>
                  ) : null}
                </div>
              </section>
            ) : null}

            {subtitledVideo ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <Video size={18} />
                  字幕焼き込み版MP4
                </h2>
                <p className="sectionSub">
                  英語字幕を映像に焼き込んだMP4です。SRTを読み込めない再生環境でも字幕が表示されます。
                </p>
                <video className="videoPreview renderedVideoPreview" src={subtitledVideo.videoUrl} controls />
                <dl className="videoPathList">
                  <div>
                    <dt>字幕焼き込み版MP4</dt>
                    <dd>{subtitledVideo.filePath}</dd>
                  </div>
                </dl>
              </section>
            ) : null}

            {renderedVideo ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <PackageCheck size={18} />
                  配布形式
                </h2>
                <p className="sectionSub">
                  再生環境でSRTを扱える場合はSRT同梱、字幕表示を確実にしたい場合は焼き込み版を選びます。
                </p>
                <div className="choiceGrid">
                  <label className={`choiceOption ${packageSubtitleMode === "sidecar" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="packageSubtitleMode"
                      checked={packageSubtitleMode === "sidecar"}
                      onChange={() => setPackageSubtitleMode("sidecar")}
                    />
                    <span>
                      <strong>SRT同梱</strong>
                      <small>英語版MP4とSRTを別ファイルで配布</small>
                    </span>
                  </label>
                  <label className={`choiceOption ${packageSubtitleMode === "burned" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="packageSubtitleMode"
                      checked={packageSubtitleMode === "burned"}
                      onChange={() => setPackageSubtitleMode("burned")}
                      disabled={!subtitledVideo}
                    />
                    <span>
                      <strong>字幕焼き込み</strong>
                      <small>字幕入りMP4だけで再生できる形式</small>
                    </span>
                  </label>
                </div>
                <div className="actionRow">
                  <button
                    className="primaryButton"
                    type="button"
                    onClick={createPackage}
                    disabled={isCreatingPackage || (packageSubtitleMode === "burned" && !subtitledVideo)}
                  >
                    {isCreatingPackage ? "作成中" : "配布用パッケージ作成"}
                  </button>
                </div>
              </section>
            ) : null}

            {distributionPackage ? (
              <section className="card panel">
                <h2 className="sectionTitle">
                  <PackageCheck size={18} />
                  配布用パッケージ
                </h2>
                <p className="sectionSub">
                  元の日本語MP4は含めず、英語版MP4と確認用ファイルだけを作業フォルダへまとめています。
                </p>
                <dl className="videoPathList">
                  <div>
                    <dt>パッケージフォルダ</dt>
                    <dd>{distributionPackage.packageDir}</dd>
                  </div>
                  {distributionPackage.files.map((file) => (
                    <div key={file.filePath}>
                      <dt>{file.label}</dt>
                      <dd>{file.filePath}</dd>
                    </div>
                  ))}
                </dl>
                <div className="actionRow">
                  <a className="primaryButton" href={distributionPackage.zipUrl}>
                    ZIPをダウンロード
                  </a>
                </div>
              </section>
            ) : null}

            <section className="card videoPreviewCard">
              <video
                className="videoPreview"
                src={selectedVideo.objectUrl}
                controls
                preload="metadata"
                onLoadedMetadata={updateVideoMetadata}
              />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

function CommandStatus({
  label,
  available,
  version
}: {
  label: string;
  available: boolean;
  version?: string;
}) {
  return (
    <div className="videoCommandStatus">
      <span className={`statusDot ${available ? "" : "recording"}`} />
      <div>
        <div className="videoCommandName">{label}: {available ? "OK" : "NG"}</div>
        {version ? <div className="videoCommandVersion">{version}</div> : null}
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function formatDuration(seconds: number) {
  const rounded = Math.round(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const restSeconds = rounded % 60;
  if (hours > 0) {
    return `${hours}:${padTime(minutes)}:${padTime(restSeconds)}`;
  }
  return `${minutes}:${padTime(restSeconds)}`;
}

function padTime(value: number) {
  return value.toString().padStart(2, "0");
}
