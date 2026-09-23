import { findUnpromptedMoroccanDrift } from './textContract.js';

export interface SpokenVerificationInput {
  expectedTranscript: string;
  actualTranscript: string;
  immutableTerms?: string[];
  minimumTokenRecall?: number;
}

export interface SpokenVerificationResult {
  accepted: boolean;
  tokenRecall: number;
  missingTerms: string[];
  moroccanDrift: string[];
  reasons: string[];
}

function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ar')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value).split(' ').filter((token) => token.length > 1);
}

function includesNormalized(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}

export function verifySpokenOutput(input: SpokenVerificationInput): SpokenVerificationResult {
  const expectedTokens = tokens(input.expectedTranscript);
  const actualSet = new Set(tokens(input.actualTranscript));
  const matched = expectedTokens.filter((token) => actualSet.has(token)).length;
  const tokenRecall = expectedTokens.length === 0 ? 1 : matched / expectedTokens.length;
  const immutableTerms = [
    ...(input.immutableTerms ?? []),
    ...(input.expectedTranscript.match(/\d+(?:[.,]\d+)?/g) ?? []),
  ];
  const missingTerms = [...new Set(immutableTerms)]
    .filter((term) => !includesNormalized(input.actualTranscript, term));
  const moroccanDrift = findUnpromptedMoroccanDrift(input.expectedTranscript, input.actualTranscript);
  const minimum = input.minimumTokenRecall ?? 0.7;
  const reasons: string[] = [];
  if (tokenRecall < minimum) reasons.push(`Token recall ${tokenRecall.toFixed(2)} is below ${minimum.toFixed(2)}`);
  if (missingTerms.length) reasons.push(`Missing immutable terms: ${missingTerms.join(', ')}`);
  if (moroccanDrift.length) reasons.push('Unprompted high-confidence Moroccan wording detected');
  return { accepted: reasons.length === 0, tokenRecall, missingTerms, moroccanDrift, reasons };
}

