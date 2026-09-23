import { describe, expect, it } from 'vitest';
import {
  ALGERIAN_COMMERCE_TEXT_CONTRACT,
  buildOrderConfirmationScript,
  buildTtsDirectorPrompt,
  DEFAULT_VOICE,
  findUnpromptedMoroccanDrift,
  verifySpokenOutput,
  pcm16LeToWav,
} from '../src/index.js';

describe('Algerian commerce contract', () => {
  it('defaults to Sulafat and keeps facts in the spoken script', () => {
    const script = buildOrderConfirmationScript({
      assistantSpoken: 'آيرا',
      storeSpoken: 'بوتيك أطلس',
      productSpoken: 'أنسامبل نوار',
      destinationSpoken: 'وهران',
      deliverySpoken: 'للدار',
    });
    expect(DEFAULT_VOICE).toBe('Sulafat');
    expect(script).toContain('بوتيك أطلس');
    expect(script).toContain('أنسامبل نوار');
    expect(script).toContain('وهران');
    expect(buildTtsDirectorPrompt(script)).toContain('Read the transcript exactly');
  });

  it('does not misclassify western Algerian single words as Moroccan', () => {
    expect(findUnpromptedMoroccanDrift('', 'iwa bghit nchouf le prix')).toEqual([]);
    expect(ALGERIAN_COMMERCE_TEXT_CONTRACT).toContain('iwa and forms of bgha');
  });

  it('rejects introduced Moroccan possessives seen in the Sulafat trial', () => {
    const result = verifySpokenOutput({
      expectedTranscript: 'طلبت ensemble noir والليفريزون للدار في وهران',
      actualTranscript: 'طلبتي ensemble noir واللي بغيناهو للدار في وهران، لاكوموند ديالك',
      immutableTerms: ['ensemble noir', 'وهران'],
    });
    expect(result.accepted).toBe(false);
    expect(result.moroccanDrift.length).toBeGreaterThan(0);
  });

  it('rejects a missing immutable price', () => {
    const result = verifySpokenOutput({
      expectedTranscript: 'السعر 4500 دج والليفريزون لوهران',
      actualTranscript: 'السعر والليفريزون لوهران',
      immutableTerms: ['4500', 'وهران'],
    });
    expect(result.accepted).toBe(false);
    expect(result.missingTerms).toContain('4500');
  });

  it('wraps raw Gemini PCM in a WAV container', () => {
    const wav = pcm16LeToWav(new Uint8Array([0, 0, 1, 0]));
    expect(new TextDecoder().decode(wav.slice(0, 4))).toBe('RIFF');
    expect(new TextDecoder().decode(wav.slice(8, 12))).toBe('WAVE');
  });
});
