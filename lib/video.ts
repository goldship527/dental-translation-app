import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createStoredZip } from "./zip";

const execFileAsync = promisify(execFile);

export const videoLocalizationWorkDir = path.join(process.cwd(), "work", "video-localization");
export const maxVideoUploadSizeBytes = 1024 * 1024 * 1024;

type CommandResult = {
  available: boolean;
  version?: string;
  path?: string;
  error?: string;
};

export type FfmpegStatus = {
  ffmpeg: CommandResult;
  ffprobe: CommandResult;
};

export type ExtractedAudioResult = {
  jobId: string;
  sourceFileName: string;
  audioFileName: string;
  sourcePath: string;
  audioPath: string;
};

export type ExtractedAudioFile = {
  audioFileName: string;
  audioPath: string;
  buffer: Buffer;
  durationSeconds: string;
};

export type NarrationAudioResult = {
  fileName: string;
  filePath: string;
};

export type NarrationAudioFile = NarrationAudioResult & {
  buffer: Buffer;
  contentType: string;
};

export type RenderedVideoResult = {
  fileName: string;
  filePath: string;
};

export type RenderedVideoFile = RenderedVideoResult & {
  buffer: Buffer;
  contentType: string;
};

export type SubtitleFileResult = {
  fileName: string;
  filePath: string;
};

export type SubtitleFile = SubtitleFileResult & {
  content: string;
  contentType: string;
};

export type DistributionPackageResult = {
  packageDir: string;
  files: Array<{
    label: string;
    fileName: string;
    filePath: string;
  }>;
};

export type DistributionPackageZip = {
  fileName: string;
  buffer: Buffer;
  contentType: string;
};

export async function checkFfmpegStatus(): Promise<FfmpegStatus> {
  const [ffmpeg, ffprobe] = await Promise.all([
    checkCommand("ffmpeg"),
    checkCommand("ffprobe")
  ]);

  return { ffmpeg, ffprobe };
}

export function isFfmpegReady(status: FfmpegStatus) {
  return status.ffmpeg.available && status.ffprobe.available;
}

export async function extractAudioFromMp4(fileName: string, fileBuffer: Buffer): Promise<ExtractedAudioResult> {
  if (fileBuffer.byteLength > maxVideoUploadSizeBytes) {
    throw new Error("1GBを超える動画は、まず短い検証動画でお試しください。");
  }

  const status = await checkFfmpegStatus();
  if (!isFfmpegReady(status)) {
    throw new Error("ffmpeg または ffprobe が見つかりません。ffmpeg をインストールし、開発サーバーを再起動してください。");
  }

  const jobId = randomUUID();
  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  await mkdir(jobDir, { recursive: true });

  const sourceBaseName = sanitizeBaseName(fileName) || "keynote-lecture";
  const sourceFileName = `${sourceBaseName}.mp4`;
  const audioFileName = `${sourceBaseName}.wav`;
  const sourcePath = path.join(jobDir, sourceFileName);
  const audioPath = path.join(jobDir, audioFileName);

  await writeFile(sourcePath, fileBuffer);

  await execMediaCommand("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-acodec",
    "pcm_s16le",
    audioPath
  ]);

  return {
    jobId,
    sourceFileName,
    audioFileName,
    sourcePath,
    audioPath
  };
}

export async function readExtractedAudio(jobId: string, audioFileName: string): Promise<ExtractedAudioFile> {
  if (!isSafeJobId(jobId)) {
    throw new Error("音声抽出ジョブIDが不正です。");
  }

  const safeAudioFileName = sanitizeAudioFileName(audioFileName);
  if (!safeAudioFileName) {
    throw new Error("抽出音声ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const audioPath = path.join(jobDir, safeAudioFileName);
  const resolvedJobDir = path.resolve(jobDir);
  const resolvedAudioPath = path.resolve(audioPath);

  if (!resolvedAudioPath.startsWith(resolvedJobDir + path.sep)) {
    throw new Error("作業フォルダ外の音声ファイルは読み込めません。");
  }

  const [buffer, durationSeconds] = await Promise.all([
    readFile(resolvedAudioPath),
    getMediaDurationSeconds(resolvedAudioPath)
  ]);

  return {
    audioFileName: safeAudioFileName,
    audioPath: resolvedAudioPath,
    buffer,
    durationSeconds
  };
}

export async function writeNarrationAudio({
  jobId,
  extension,
  buffer
}: {
  jobId: string;
  extension: "mp3" | "wav";
  buffer: Buffer;
}): Promise<NarrationAudioResult> {
  if (!isSafeJobId(jobId)) {
    throw new Error("音声抽出ジョブIDが不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  await mkdir(jobDir, { recursive: true });
  const fileName = `english-narration.${extension}`;
  const filePath = path.join(jobDir, fileName);
  await writeFile(filePath, buffer);
  return {
    fileName,
    filePath
  };
}

export async function readNarrationAudio(jobId: string, fileName: string): Promise<NarrationAudioFile> {
  if (!isSafeJobId(jobId)) {
    throw new Error("音声抽出ジョブIDが不正です。");
  }

  const safeFileName = sanitizeNarrationFileName(fileName);
  if (!safeFileName) {
    throw new Error("ナレーション音声ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const filePath = path.join(jobDir, safeFileName);
  const resolvedJobDir = path.resolve(jobDir);
  const resolvedFilePath = path.resolve(filePath);

  if (!resolvedFilePath.startsWith(resolvedJobDir + path.sep)) {
    throw new Error("作業フォルダ外の音声ファイルは読み込めません。");
  }

  return {
    fileName: safeFileName,
    filePath: resolvedFilePath,
    buffer: await readFile(resolvedFilePath),
    contentType: safeFileName.endsWith(".mp3") ? "audio/mpeg" : "audio/wav"
  };
}

export async function renderEnglishVideo({
  jobId,
  sourceFileName,
  narrationFileName
}: {
  jobId: string;
  sourceFileName: string;
  narrationFileName: string;
}): Promise<RenderedVideoResult> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const status = await checkFfmpegStatus();
  if (!isFfmpegReady(status)) {
    throw new Error("ffmpeg または ffprobe が見つかりません。ffmpeg をインストールし、開発サーバーを再起動してください。");
  }

  const safeSourceFileName = sanitizeVideoFileName(sourceFileName);
  const safeNarrationFileName = sanitizeNarrationFileName(narrationFileName);
  if (!safeSourceFileName || !safeNarrationFileName) {
    throw new Error("動画またはナレーション音声ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const sourcePath = resolveJobFilePath(jobDir, safeSourceFileName);
  const narrationPath = resolveJobFilePath(jobDir, safeNarrationFileName);
  const fileName = "english-version.mp4";
  const filePath = resolveJobFilePath(jobDir, fileName);

  await execMediaCommand("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-i",
    narrationPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    filePath
  ]);

  return {
    fileName,
    filePath
  };
}

export async function renderSubtitledVideo({
  jobId,
  renderedVideoFileName,
  subtitleFileName
}: {
  jobId: string;
  renderedVideoFileName: string;
  subtitleFileName: string;
}): Promise<RenderedVideoResult> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const status = await checkFfmpegStatus();
  if (!isFfmpegReady(status)) {
    throw new Error("ffmpeg または ffprobe が見つかりません。ffmpeg をインストールし、開発サーバーを再起動してください。");
  }

  const safeRenderedVideoFileName = sanitizeRenderedVideoFileName(renderedVideoFileName);
  const safeSubtitleFileName = sanitizeSubtitleFileName(subtitleFileName);
  if (!safeRenderedVideoFileName || !safeSubtitleFileName) {
    throw new Error("英語版動画または字幕ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const fileName = "english-version-subtitled.mp4";
  const filePath = resolveJobFilePath(jobDir, fileName);

  await execMediaCommand(
    "ffmpeg",
    [
      "-y",
      "-i",
      safeRenderedVideoFileName,
      "-vf",
      `subtitles=${safeSubtitleFileName}`,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "22",
      "-c:a",
      "copy",
      "-movflags",
      "+faststart",
      fileName
    ],
    { cwd: jobDir, timeout: 300000 }
  );

  return {
    fileName,
    filePath
  };
}

export async function readRenderedVideo(jobId: string, fileName: string): Promise<RenderedVideoFile> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const safeFileName = sanitizeRenderedVideoFileName(fileName);
  if (!safeFileName) {
    throw new Error("英語版動画ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const filePath = resolveJobFilePath(jobDir, safeFileName);

  return {
    fileName: safeFileName,
    filePath,
    buffer: await readFile(filePath),
    contentType: "video/mp4"
  };
}

export async function writeSubtitleFile(jobId: string, content: string): Promise<SubtitleFileResult> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  await mkdir(jobDir, { recursive: true });
  const fileName = "english-subtitles.srt";
  const filePath = resolveJobFilePath(jobDir, fileName);
  await writeFile(filePath, content, "utf8");

  return {
    fileName,
    filePath
  };
}

export async function readSubtitleFile(jobId: string, fileName: string): Promise<SubtitleFile> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const safeFileName = sanitizeSubtitleFileName(fileName);
  if (!safeFileName) {
    throw new Error("字幕ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const filePath = resolveJobFilePath(jobDir, safeFileName);

  return {
    fileName: safeFileName,
    filePath,
    content: await readFile(filePath, "utf8"),
    contentType: "application/x-subrip; charset=utf-8"
  };
}

export async function createDistributionPackage({
  jobId,
  sourceFileName,
  renderedVideoFileName,
  subtitleFileName,
  burnedInSubtitles,
  transcriptText,
  englishText
}: {
  jobId: string;
  sourceFileName: string;
  renderedVideoFileName: string;
  subtitleFileName?: string;
  burnedInSubtitles?: boolean;
  transcriptText: string;
  englishText: string;
}): Promise<DistributionPackageResult> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const safeSourceFileName = sanitizeVideoFileName(sourceFileName);
  const safeRenderedVideoFileName = sanitizeRenderedVideoFileName(renderedVideoFileName);
  const safeSubtitleFileName = subtitleFileName ? sanitizeSubtitleFileName(subtitleFileName) : "";

  if (!safeSourceFileName || !safeRenderedVideoFileName) {
    throw new Error("配布用パッケージに必要な動画ファイル名が不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const packageDir = path.join(jobDir, "package");
  await mkdir(packageDir, { recursive: true });
  await clearPackageDirectory(packageDir);

  const files: DistributionPackageResult["files"] = [];
  const renderedVideoSource = resolveJobFilePath(jobDir, safeRenderedVideoFileName);
  const renderedVideoTarget = path.join(packageDir, "english-version.mp4");
  await copyFile(renderedVideoSource, renderedVideoTarget);
  files.push({
    label: burnedInSubtitles ? "字幕焼き込み版MP4" : "英語版MP4",
    fileName: "english-version.mp4",
    filePath: renderedVideoTarget
  });

  if (safeSubtitleFileName && !burnedInSubtitles) {
    const subtitleSource = resolveJobFilePath(jobDir, safeSubtitleFileName);
    const subtitleTarget = path.join(packageDir, "english-subtitles.srt");
    await copyFile(subtitleSource, subtitleTarget);
    files.push({
      label: "英語字幕SRT",
      fileName: "english-subtitles.srt",
      filePath: subtitleTarget
    });
  }

  const transcriptPath = path.join(packageDir, "japanese-transcript.txt");
  await writeFile(transcriptPath, transcriptText, "utf8");
  files.push({
    label: "日本語文字起こし",
    fileName: "japanese-transcript.txt",
    filePath: transcriptPath
  });

  const englishPath = path.join(packageDir, "english-script.txt");
  await writeFile(englishPath, englishText, "utf8");
  files.push({
    label: "英訳原稿",
    fileName: "english-script.txt",
    filePath: englishPath
  });

  const checklistPath = path.join(packageDir, "review-checklist.md");
  await writeFile(checklistPath, buildReviewChecklist(), "utf8");
  files.push({
    label: "要確認リスト",
    fileName: "review-checklist.md",
    filePath: checklistPath
  });

  const readmePath = path.join(packageDir, "README.md");
  await writeFile(
    readmePath,
    buildPackageReadme({
      jobId,
      sourceFileName: safeSourceFileName,
      hasSubtitles: Boolean(safeSubtitleFileName),
      burnedInSubtitles: Boolean(burnedInSubtitles)
    }),
    "utf8"
  );
  files.push({
    label: "README",
    fileName: "README.md",
    filePath: readmePath
  });

  const manifestPath = path.join(packageDir, "manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        packageType: "dental-lecture-localization",
        createdAt: new Date().toISOString(),
        jobId,
        sourceFileName: safeSourceFileName,
        includesOriginalJapaneseVideo: false,
        subtitleMode: burnedInSubtitles ? "burned-in" : safeSubtitleFileName ? "sidecar-srt" : "none",
        files: files.map(({ label, fileName }) => ({ label, fileName }))
      },
      null,
      2
    ),
    "utf8"
  );
  files.push({
    label: "manifest",
    fileName: "manifest.json",
    filePath: manifestPath
  });

  return {
    packageDir,
    files
  };
}

export async function readDistributionPackageZip(jobId: string): Promise<DistributionPackageZip> {
  if (!isSafeJobId(jobId)) {
    throw new Error("動画ローカライズの作業IDが不正です。");
  }

  const jobDir = path.join(videoLocalizationWorkDir, jobId);
  const packageDir = resolveJobFilePath(jobDir, "package");
  const files = [
    "english-version.mp4",
    "english-subtitles.srt",
    "japanese-transcript.txt",
    "english-script.txt",
    "review-checklist.md",
    "README.md",
    "manifest.json"
  ];

  const entries = [];
  for (const fileName of files) {
    const filePath = resolvePackageFilePath(packageDir, fileName);
    if (!(await canAccessFile(filePath))) continue;
    entries.push({
      fileName,
      buffer: await readFile(filePath)
    });
  }

  if (entries.length === 0) {
    throw new Error("配布用パッケージがまだ作成されていません。");
  }

  return {
    fileName: "dental-lecture-localization-package.zip",
    buffer: createStoredZip(entries),
    contentType: "application/zip"
  };
}

function sanitizeBaseName(fileName: string) {
  const parsed = path.parse(fileName);
  return parsed.name
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeAudioFileName(fileName: string) {
  const parsed = path.parse(fileName);
  if (parsed.ext.toLowerCase() !== ".wav") return "";
  const safeBaseName = sanitizeBaseName(parsed.name);
  return safeBaseName ? `${safeBaseName}.wav` : "";
}

function sanitizeVideoFileName(fileName: string) {
  const parsed = path.parse(fileName);
  if (parsed.ext.toLowerCase() !== ".mp4") return "";
  const safeBaseName = sanitizeBaseName(parsed.name);
  return safeBaseName ? `${safeBaseName}.mp4` : "";
}

function sanitizeNarrationFileName(fileName: string) {
  return /^english-narration\.(mp3|wav)$/i.test(fileName) ? fileName : "";
}

function sanitizeRenderedVideoFileName(fileName: string) {
  return fileName === "english-version.mp4" || fileName === "english-version-subtitled.mp4" ? fileName : "";
}

function sanitizeSubtitleFileName(fileName: string) {
  return fileName === "english-subtitles.srt" ? fileName : "";
}

function isSafeJobId(jobId: string) {
  return /^[a-f0-9-]{36}$/i.test(jobId);
}

function resolveJobFilePath(jobDir: string, fileName: string) {
  const resolvedJobDir = path.resolve(jobDir);
  const resolvedFilePath = path.resolve(path.join(jobDir, fileName));

  if (!resolvedFilePath.startsWith(resolvedJobDir + path.sep)) {
    throw new Error("作業フォルダ外のファイルは読み込めません。");
  }

  return resolvedFilePath;
}

function resolvePackageFilePath(packageDir: string, fileName: string) {
  const resolvedPackageDir = path.resolve(packageDir);
  const resolvedFilePath = path.resolve(path.join(packageDir, fileName));

  if (!resolvedFilePath.startsWith(resolvedPackageDir + path.sep)) {
    throw new Error("配布用パッケージ外のファイルは読み込めません。");
  }

  return resolvedFilePath;
}

async function clearPackageDirectory(packageDir: string) {
  const files = [
    "english-version.mp4",
    "english-subtitles.srt",
    "japanese-transcript.txt",
    "english-script.txt",
    "review-checklist.md",
    "README.md",
    "manifest.json"
  ];

  await Promise.all(
    files.map((fileName) => rm(resolvePackageFilePath(packageDir, fileName), { force: true }))
  );
}

async function checkCommand(command: "ffmpeg" | "ffprobe"): Promise<CommandResult> {
  try {
    const commandPath = await resolveMediaCommand(command);
    const { stdout, stderr } = await execFileAsync(commandPath, ["-version"], {
      timeout: 5000,
      windowsHide: true
    });
    return {
      available: true,
      path: commandPath,
      version: parseVersionLine(stdout || stderr)
    };
  } catch (reason) {
    return {
      available: false,
      error: reason instanceof Error ? reason.message : `${command} を確認できませんでした。`
    };
  }
}

function parseVersionLine(output: string) {
  return output.split(/\r?\n/).find((line) => line.trim())?.trim();
}

async function getMediaDurationSeconds(filePath: string) {
  try {
    const { stdout } = await execMediaCommand("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);
    const duration = Number(stdout.trim());
    return Number.isFinite(duration) ? duration.toFixed(2) : "unknown";
  } catch {
    return "unknown";
  }
}

async function execMediaCommand(
  command: "ffmpeg" | "ffprobe",
  args: string[],
  options: { cwd?: string; timeout?: number } = {}
) {
  const commandPath = await resolveMediaCommand(command);
  return execFileAsync(commandPath, args, {
    ...options,
    windowsHide: true
  });
}

async function resolveMediaCommand(command: "ffmpeg" | "ffprobe") {
  const directCommand = process.platform === "win32" ? `${command}.exe` : command;

  if (process.platform === "win32") {
    for (const candidate of await getWindowsMediaCommandCandidates(command)) {
      if (await canAccessFile(candidate)) {
        return candidate;
      }
    }
  }

  if (await canRunCommand(directCommand)) {
    return directCommand;
  }

  return directCommand;
}

async function canRunCommand(commandPath: string) {
  try {
    await execFileAsync(commandPath, ["-version"], {
      timeout: 5000,
      windowsHide: true
    });
    return true;
  } catch {
    return false;
  }
}

async function getWindowsMediaCommandCandidates(command: "ffmpeg" | "ffprobe") {
  if (process.platform !== "win32") return [];

  const executableName = `${command}.exe`;
  const candidates: string[] = [];
  const pathParts = [process.env.LOCALAPPDATA, path.join(os.homedir(), "AppData", "Local")].filter(
    (value): value is string => Boolean(value)
  );

  for (const localAppData of pathParts) {
    candidates.push(
      path.join(localAppData, "Microsoft", "WinGet", "Links", executableName),
      path.join(
        localAppData,
        "Microsoft",
        "WinGet",
        "Packages",
        "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
        "ffmpeg-8.1.1-full_build",
        "bin",
        executableName
      )
    );
  }

  candidates.push(...(await findWingetFfmpegExecutables(executableName, pathParts)));

  return Array.from(new Set(candidates));
}

async function findWingetFfmpegExecutables(executableName: string, localAppDataPaths: string[]) {
  const candidates: string[] = [];

  for (const localAppData of localAppDataPaths) {
    const packagesDir = path.join(localAppData, "Microsoft", "WinGet", "Packages");
    const packageEntries = await readDirEntries(packagesDir);

    for (const packageEntry of packageEntries) {
      if (!packageEntry.isDirectory() || !packageEntry.name.startsWith("Gyan.FFmpeg_")) continue;

      const packageDir = path.join(packagesDir, packageEntry.name);
      const buildEntries = await readDirEntries(packageDir);

      for (const buildEntry of buildEntries) {
        if (!buildEntry.isDirectory() || !buildEntry.name.startsWith("ffmpeg-")) continue;
        candidates.push(path.join(packageDir, buildEntry.name, "bin", executableName));
      }
    }
  }

  return candidates;
}

async function readDirEntries(directoryPath: string) {
  try {
    return await readdir(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function canAccessFile(filePath: string) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function buildReviewChecklist() {
  return [
    "# Review checklist",
    "",
    "- Confirm dental terminology, product names, implant system names, and manufacturer names.",
    "- Confirm all numbers, units, torque values, lengths, and angles.",
    "- Confirm maxillary/mandibular, left/right, anterior/posterior references.",
    "- Confirm contraindications, indications, warnings, and procedural limitations.",
    "- Confirm the English narration does not add diagnosis, treatment planning, or medical advice.",
    "- Confirm the English MP4 does not contain the original Japanese audio.",
    "- Confirm subtitles are readable and timing is acceptable before distribution.",
    ""
  ].join("\n");
}

function buildPackageReadme({
  jobId,
  sourceFileName,
  hasSubtitles,
  burnedInSubtitles
}: {
  jobId: string;
  sourceFileName: string;
  hasSubtitles: boolean;
  burnedInSubtitles: boolean;
}) {
  return [
    "# Dental lecture localization package",
    "",
    "This package was generated by Dental Lecture Translator.",
    "",
    "## Contents",
    "",
    burnedInSubtitles
      ? "- `english-version.mp4`: localized English narration video with burned-in subtitles"
      : "- `english-version.mp4`: localized English narration video",
    hasSubtitles && !burnedInSubtitles
      ? "- `english-subtitles.srt`: English subtitle file"
      : burnedInSubtitles
        ? "- English subtitles are burned into the MP4"
        : "- English subtitle file was not included in this package",
    "- `japanese-transcript.txt`: Japanese transcript",
    "- `english-script.txt`: English narration script",
    "- `review-checklist.md`: human review checklist",
    "- `manifest.json`: package metadata",
    "",
    "## Notes",
    "",
    "- The original Japanese MP4 is not included.",
    "- The translation is for dental lecture and educational communication support.",
    "- This package is not intended for diagnosis, treatment planning, or medical decision-making.",
    "- A human reviewer must confirm terminology, numbers, units, indications, contraindications, and subtitle timing.",
    "",
    "## Source",
    "",
    `- Source file name: ${sourceFileName}`,
    `- Job ID: ${jobId}`,
    ""
  ].join("\n");
}
