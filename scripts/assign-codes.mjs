/**
 * One-off migration — gives every guest an `inviteCode`.
 *
 * Usage (from project root):
 *   node scripts/assign-codes.mjs
 *
 * Reads VITE_FIREBASE_* env vars from .env, walks the `guests` collection,
 * and assigns a 6-character invite code to anyone who doesn't already have
 * one. Idempotent — safe to re-run; existing codes are left alone.
 *
 * Codes are drawn from a 31-char alphabet that excludes the visually
 * confusable characters I, L, O, 0, 1. ~887 million possible 6-char codes,
 * so collisions are statistically impossible for a guest list this size,
 * but the script still checks for duplicates and retries on the rare hit.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

// ── Load .env ────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envText   = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

console.log('▸ Project:', firebaseConfig.projectId);

// ── Code generator ───────────────────────────────────────────────────────
// 31 chars — no I, L, O, 0, 1 (visually confusable when printed/handwritten)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

function makeCode() {
  let s = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}

// ── Load all guests, build set of existing codes ────────────────────────
const snap = await getDocs(collection(db, 'guests'));
console.log(`▸ Found ${snap.size} guests`);

const existingCodes = new Set();
const needsCode     = [];

for (const d of snap.docs) {
  const data = d.data();
  if (data.inviteCode) {
    existingCodes.add(data.inviteCode);
  } else {
    needsCode.push({ id: d.id, name: data.name });
  }
}

console.log(`▸ ${existingCodes.size} already have codes, ${needsCode.length} need one`);

if (needsCode.length === 0) {
  console.log('✓ Nothing to do.');
  process.exit(0);
}

// ── Assign codes, avoiding collisions ───────────────────────────────────
const assignments = [];
for (const guest of needsCode) {
  let code;
  let attempts = 0;
  do {
    code = makeCode();
    attempts++;
    if (attempts > 50) throw new Error('Cannot find a free code — alphabet exhausted?');
  } while (existingCodes.has(code));
  existingCodes.add(code);
  assignments.push({ ...guest, code });
}

// ── Batched writes ───────────────────────────────────────────────────────
const BATCH_SIZE = 400;
let written = 0;

for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
  const chunk = assignments.slice(i, i + BATCH_SIZE);
  const batch = writeBatch(db);
  for (const a of chunk) {
    batch.update(doc(db, 'guests', a.id), { inviteCode: a.code });
  }
  await batch.commit();
  written += chunk.length;
  console.log(`  ✓ committed batch (${written}/${assignments.length})`);
}

console.log(`\n✓ Done — assigned ${written} codes.`);
console.log('\nSample (first 5):');
for (const a of assignments.slice(0, 5)) {
  console.log(`  ${a.code}  →  ${a.name}`);
}
process.exit(0);
