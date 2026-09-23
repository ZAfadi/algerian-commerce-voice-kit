import { writeFile } from 'node:fs/promises';
import {
  buildOrderConfirmationScript,
  buildTtsDirectorPrompt,
  generateGeminiSpeech,
} from '../src/index.js';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('Set GEMINI_API_KEY before running this example');

const script = buildOrderConfirmationScript({
  assistantSpoken: 'سلافات',
  storeSpoken: 'دورا موتو',
  productSpoken: 'كاسك نوار',
  destinationSpoken: 'وهران',
  deliverySpoken: 'للدار',
});
const speech = await generateGeminiSpeech({ apiKey, prompt: buildTtsDirectorPrompt(script) });
await writeFile('dora-moto-order.wav', speech.bytes);
console.log(JSON.stringify({ output: 'dora-moto-order.wav', model: speech.model, voice: speech.voice, script }, null, 2));

