# Algerian Commerce Voice Kit

Reusable, server-side building blocks for Algerian commerce assistants. The kit keeps business facts deterministic, renders concise Algerian Darja, defaults to Google's warm **Sulafat** voice, and validates the audio back-transcript before it can be accepted.

It is intended for projects such as DORA MOTO and AIRA. It contains no customer data, credentials, store catalog, or project-specific secrets.

## Why this exists

Algerian customer service is not Moroccan Darija and is not formal Arabic. A useful national baseline is short Algerian Darja with familiar French commerce words such as `commande`, `livraison`, `stock`, `prix`, and `taille`. Arabic-script customers may still use those Latin-script words. Regional forms must not be rejected from a single word: for example, `iwa` and forms of `bgha` also occur in western Algeria. Drift checks therefore target strong phrases and added wording, not an accent stereotype.

Voice generation adds another risk: a natural-sounding model can paraphrase the approved script and introduce another dialect. This kit treats synthesis as untrusted output:

1. The application supplies verified business facts.
2. The kit builds a short approved spoken script.
3. Gemini creates Sulafat audio from an exact-transcript director prompt.
4. A speech-to-text service back-transcribes the result.
5. `verifySpokenOutput` rejects missing numbers/terms and unprompted high-confidence Moroccan drift.

Do not dispatch audio when verification fails. Human review remains appropriate for new brands, products, place names, or regional variants.

## Install and test

```bash
npm install
npm test
npm run typecheck
npm run build
```

## Generate the DORA MOTO example

Set `GEMINI_API_KEY` in the server environment, then:

```bash
npm run sample:dora
```

The example writes `dora-moto-order.wav`. The generated file is deliberately ignored by Git.

## Core usage

```ts
import {
  buildOrderConfirmationScript,
  buildTtsDirectorPrompt,
  generateGeminiSpeech,
  transcribeOpenAiWav,
  verifySpokenOutput,
} from '@zafadi/algerian-commerce-voice-kit';

const script = buildOrderConfirmationScript({
  assistantSpoken: 'سلافات',
  storeSpoken: 'دورا موتو',
  productSpoken: 'كاسك نوار',
  destinationSpoken: 'وهران',
  deliverySpoken: 'للدار',
});

const audio = await generateGeminiSpeech({
  apiKey: process.env.GEMINI_API_KEY!,
  prompt: buildTtsDirectorPrompt(script),
});

const backTranscript = await transcribeOpenAiWav({
  apiKey: process.env.OPENAI_API_KEY!,
  wav: audio.bytes,
  prompt: script,
});

const result = verifySpokenOutput({
  expectedTranscript: script,
  actualTranscript: backTranscript,
  immutableTerms: ['دورا موتو', 'كاسك نوار', 'وهران'],
});
```

Use explicit `*Spoken` values for brands, people, products, and places. Automatic transliteration is intentionally absent because a plausible guess can be pronounced incorrectly.

## Live conversations

`ALGERIAN_COMMERCE_TEXT_CONTRACT` can be appended to a text or Gemini Live system instruction. Keep price, stock, delivery, payment, consent, and order mutations in deterministic tools. The model may phrase verified results; it must not invent them or execute an irreversible action from free text.

This package is private and server-only. Never expose provider keys in a browser or commit real customer recordings or transcripts.
