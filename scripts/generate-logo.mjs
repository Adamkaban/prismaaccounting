/**
 * generate-logo.mjs
 * Generates logo variants for Prisma Accounting via OpenRouter (Grok / Gemini).
 *
 * Usage:
 *   node scripts/generate-logo.mjs               # 3 variants, grok
 *   node scripts/generate-logo.mjs --model gemini
 *   node scripts/generate-logo.mjs --count 5
 *   node scripts/generate-logo.mjs --icon-only   # icon mark only (no text)
 *   node scripts/generate-logo.mjs --overwrite   # re-generate existing files
 *
 * Requires OPENROUTER_API_KEY in .env (project root or BigBass fallback).
 * Output: public/logo-gen-1.png, logo-gen-2.png, ...
 */

import { readFileSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT         = fileURLToPath(new URL('..', import.meta.url));
const BIGBASS_ROOT = '/Users/usara/Desktop/Проекты/Сайты/BigBass slots';

// ─── .env loader ─────────────────────────────────────────────────────────────

function loadEnv(dir) {
  const path = join(dir, '.env');
  if (!existsSync(path)) return false;
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?([^"#\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
  return true;
}

loadEnv(ROOT) || loadEnv(BIGBASS_ROOT);

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) {
  console.error('✗ OPENROUTER_API_KEY not found.');
  console.error('  Add to .env: OPENROUTER_API_KEY=sk-or-v1-...');
  console.error('  Get key: https://openrouter.ai/keys');
  process.exit(1);
}

// ─── Args ─────────────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const MODEL     = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'grok';
const COUNT     = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1]) : 3;
const ICON_ONLY = args.includes('--icon-only');
const OVERWRITE = args.includes('--overwrite');

const MODEL_ID = MODEL === 'gemini'
  ? 'google/gemini-3.1-flash-image-preview'
  : 'x-ai/grok-imagine-image-quality';

// ─── Prompts ──────────────────────────────────────────────────────────────────

const WORDMARK_PROMPT = [
  'Minimalist professional logo for accounting firm "Prisma Accounting".',
  'Horizontal layout: small rounded square icon on the left, wordmark text on the right.',
  'Icon: deep emerald green background, clean white geometric letter P centered inside.',
  'Wordmark text: "Prisma Accounting" in medium weight geometric sans-serif, dark charcoal color.',
  'Pure white background. Flat design, zero gradients, zero shadows, zero decorative elements.',
  'Crisp sharp edges. High contrast. Professional Canadian fintech aesthetic.',
  'No taglines, no flourishes, no additional symbols.',
].join(' ');

const ICON_PROMPT = [
  'Minimalist logo icon mark.',
  'Square composition: deep emerald green rounded rectangle background.',
  'Clean white geometric sans-serif letter P centered, bold weight, no serifs.',
  'Pure white background outside the mark. Flat vector style.',
  'Zero gradients, zero shadows, zero decorative elements.',
  'Professional fintech aesthetic, clean and crisp.',
].join(' ');

// ─── OpenRouter image fetcher ─────────────────────────────────────────────────

async function fetchOpenRouter(prompt) {
  const body = {
    model: MODEL_ID,
    messages: [{ role: 'user', content: prompt }],
    modalities: ['image'],
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter HTTP ${res.status}: ${err.slice(0, 300)}`);
  }

  const json = await res.json();

  // Grok: choices[0].message.images[0].image_url.url
  const images = json?.choices?.[0]?.message?.images;
  if (images?.length) {
    const dataUrl = images[0]?.image_url?.url;
    if (dataUrl) return Buffer.from(dataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  }

  // Gemini: choices[0].message.content (array with image_url parts)
  const content = json?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    const imgPart = content.find(p => p.type === 'image_url');
    if (imgPart?.image_url?.url) {
      return Buffer.from(imgPart.image_url.url.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }
  }

  throw new Error(`No image in response: ${JSON.stringify(json).slice(0, 200)}`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const prompt = ICON_ONLY ? ICON_PROMPT : WORDMARK_PROMPT;
const prefix = ICON_ONLY ? 'logo-icon-gen' : 'logo-gen';

console.log(`=== Prisma Logo Generator [${MODEL} / ${MODEL_ID}] ===`);
console.log(`Mode: ${ICON_ONLY ? 'icon only' : 'full wordmark'}`);
console.log(`Variants: ${COUNT}\n`);

for (let i = 1; i <= COUNT; i++) {
  const outPath = join(ROOT, 'public', `${prefix}-${i}.png`);

  if (!OVERWRITE && existsSync(outPath)) {
    console.log(`  skip ${prefix}-${i}.png (exists, use --overwrite to replace)`);
    continue;
  }

  console.log(`[${i}/${COUNT}] Generating via ${MODEL}...`);

  try {
    const buf = await fetchOpenRouter(prompt);
    await writeFile(outPath, buf);
    console.log(`  ✓ saved → public/${prefix}-${i}.png\n`);
  } catch (e) {
    console.error(`  ✗ failed: ${e.message}\n`);
  }

  if (i < COUNT) await new Promise(r => setTimeout(r, 2000));
}

console.log('=== Done ===');
console.log(`\nFiles: public/${prefix}-1..${COUNT}.png`);
console.log(`Pick best variant, rename to logo.png or update logo.svg.`);
