import { GoogleGenAI } from '@google/genai';
import { pcm16LeToWav } from './wav.js';
import { DEFAULT_TTS_MODEL, DEFAULT_VOICE } from './voiceProfile.js';

export interface GenerateGeminiSpeechInput {
  apiKey: string;
  prompt: string;
  model?: string;
  voice?: string;
}

export interface GeneratedSpeech {
  bytes: Uint8Array;
  mimeType: string;
  sampleRate: number;
  voice: string;
  model: string;
}

export async function generateGeminiSpeech(input: GenerateGeminiSpeechInput): Promise<GeneratedSpeech> {
  if (!input.apiKey.trim()) throw new Error('Gemini API key is required');
  const model = input.model ?? DEFAULT_TTS_MODEL;
  const voice = input.voice ?? DEFAULT_VOICE;
  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const response = await ai.interactions.create({
    model,
    input: input.prompt,
    response_modalities: ['audio'],
    generation_config: {
      speech_config: [{ voice, language: 'ar' }],
    },
    store: false,
  });
  const audio = response.output_audio;
  if (!audio?.data) throw new Error('Gemini did not return audio data');
  const raw = Uint8Array.from(Buffer.from(audio.data, 'base64'));
  const sampleRate = audio.sample_rate ?? 24_000;
  const isPcm = audio.mime_type === 'audio/l16';
  return {
    bytes: isPcm ? pcm16LeToWav(raw, sampleRate, audio.channels ?? 1) : raw,
    mimeType: isPcm ? 'audio/wav' : (audio.mime_type ?? 'application/octet-stream'),
    sampleRate,
    voice,
    model,
  };
}
