export function wrapPcmAsWav(pcmData: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const buffer = Buffer.alloc(44 + pcmData.length);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + pcmData.length, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitDepth, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(pcmData.length, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}
