import { SULAFAT_ALGERIAN_COMMERCE_PROFILE } from './voiceProfile.js';

export function buildTtsDirectorPrompt(transcript: string): string {
  return [
    '# Audio profile',
    `Voice: ${SULAFAT_ALGERIAN_COMMERCE_PROFILE.voice}.`,
    `Character: ${SULAFAT_ALGERIAN_COMMERCE_PROFILE.character}.`,
    `Pace: ${SULAFAT_ALGERIAN_COMMERCE_PROFILE.pace}.`,
    `Delivery: ${SULAFAT_ALGERIAN_COMMERCE_PROFILE.delivery}.`,
    '',
    '# Director notes',
    'Speak in neutral urban Algerian Darja. Keep familiar French commerce loanwords natural.',
    'Read the transcript exactly. Do not translate, paraphrase, add words, remove words, or change dialect.',
    'Do not use Moroccan pronunciation or Moroccan alternatives. Keep brand, product, place, and number pronunciation faithful to the supplied spellings.',
    '',
    '# Exact transcript',
    transcript,
  ].join('\n');
}

