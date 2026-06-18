export function generateEnglishSrt(text: string, durationSeconds: number | string | null | undefined) {
  const chunks = buildSubtitleChunks(text);
  if (chunks.length === 0) return "";

  const duration = normalizeDuration(durationSeconds, estimateDurationFromText(text));
  const weights = chunks.map((chunk) => Math.max(chunk.replace(/\s+/g, "").length, 24));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = 0;

  return chunks
    .map((chunk, index) => {
      const remainingDuration = Math.max(duration - cursor, 0.5);
      const proportionalDuration =
        index === chunks.length - 1 ? remainingDuration : duration * (weights[index] / totalWeight);
      const segmentDuration = Math.max(1.5, Math.min(proportionalDuration, remainingDuration));
      const start = cursor;
      const end = index === chunks.length - 1 ? duration : Math.min(duration, cursor + segmentDuration);
      cursor = end;

      return [
        String(index + 1),
        `${formatSrtTime(start)} --> ${formatSrtTime(Math.max(end, start + 0.5))}`,
        wrapSubtitleText(chunk),
        ""
      ].join("\n");
    })
    .join("\n");
}

function buildSubtitleChunks(text: string) {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= 120) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    chunks.push(...splitLongSentence(sentence));
    current = "";
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitLongSentence(sentence: string) {
  const words = sentence.split(/\s+/).filter(Boolean);
  const chunkCount = Math.max(1, Math.ceil(sentence.length / 96));
  const wordsPerChunk = Math.ceil(words.length / chunkCount);
  const chunks: string[] = [];

  for (let index = 0; index < words.length; index += wordsPerChunk) {
    chunks.push(words.slice(index, index + wordsPerChunk).join(" "));
  }

  return chunks;
}

function wrapSubtitleText(text: string) {
  if (text.length <= 54) return text;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 54 || lines.length >= 1) {
      current = candidate;
    } else {
      const unitSafeSplit = splitBeforeDanglingUnit(current, word);
      if (unitSafeSplit) {
        lines.push(unitSafeSplit.line);
        current = unitSafeSplit.nextLine;
        continue;
      }
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.join("\n");
}

function splitBeforeDanglingUnit(currentLine: string, nextWord: string) {
  if (!/^(mm|cm|Ncm|kg|g|mL|%)$/i.test(nextWord)) return null;

  const words = currentLine.split(/\s+/).filter(Boolean);
  const lastWord = words.at(-1);
  if (!lastWord || !/^\d+(?:\.\d+)?$/.test(lastWord) || words.length < 2) return null;

  return {
    line: words.slice(0, -1).join(" "),
    nextLine: `${lastWord} ${nextWord}`
  };
}

function normalizeDuration(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return fallback;
}

function estimateDurationFromText(text: string) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(8, wordCount / 2.4);
}

function formatSrtTime(seconds: number) {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const displaySeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  return `${pad(hours)}:${pad(minutes)}:${pad(displaySeconds)},${milliseconds.toString().padStart(3, "0")}`;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
