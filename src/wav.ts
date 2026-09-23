function writeAscii(target: Uint8Array, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) target[offset + i] = value.charCodeAt(i);
}

function writeU16(target: Uint8Array, offset: number, value: number): void {
  new DataView(target.buffer).setUint16(offset, value, true);
}

function writeU32(target: Uint8Array, offset: number, value: number): void {
  new DataView(target.buffer).setUint32(offset, value, true);
}

export function pcm16LeToWav(pcm: Uint8Array, sampleRate = 24_000, channels = 1): Uint8Array {
  const header = new Uint8Array(44);
  const byteRate = sampleRate * channels * 2;
  writeAscii(header, 0, 'RIFF');
  writeU32(header, 4, 36 + pcm.length);
  writeAscii(header, 8, 'WAVEfmt ');
  writeU32(header, 16, 16);
  writeU16(header, 20, 1);
  writeU16(header, 22, channels);
  writeU32(header, 24, sampleRate);
  writeU32(header, 28, byteRate);
  writeU16(header, 32, channels * 2);
  writeU16(header, 34, 16);
  writeAscii(header, 36, 'data');
  writeU32(header, 40, pcm.length);
  const wav = new Uint8Array(header.length + pcm.length);
  wav.set(header);
  wav.set(pcm, header.length);
  return wav;
}

