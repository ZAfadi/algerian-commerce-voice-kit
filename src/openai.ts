export interface TranscribeWavInput {
  apiKey: string;
  wav: Uint8Array;
  fileName?: string;
  model?: string;
  prompt?: string;
}

export async function transcribeOpenAiWav(input: TranscribeWavInput): Promise<string> {
  if (!input.apiKey.trim()) throw new Error('OpenAI API key is required');
  const body = new FormData();
  body.set('model', input.model ?? 'gpt-4o-mini-transcribe');
  body.set('file', new Blob([input.wav as BlobPart], { type: 'audio/wav' }), input.fileName ?? 'speech.wav');
  body.set('language', 'ar');
  if (input.prompt) body.set('prompt', input.prompt);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${input.apiKey}` },
    body,
  });
  if (!response.ok) throw new Error(`OpenAI transcription failed with HTTP ${response.status}`);
  const payload = await response.json() as { text?: unknown };
  if (typeof payload.text !== 'string' || !payload.text.trim()) throw new Error('OpenAI returned no transcript');
  return payload.text.trim();
}

