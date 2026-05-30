/**
 * One-off seed script — imports guests.json into Firestore.
 *
 * Usage (from project root):
 *   node scripts/seed-guests.mjs
 *
 * Reads VITE_FIREBASE_* env vars from .env, connects to Firestore using the
 * client SDK, and writes every entry from guests.json into the `guests`
 * collection. Firestore must be in test mode (open writes) — which it is for
 * the first 30 days after creation.
 *
 * Safe to re-run: it skips any guest whose `name` already exists in the
 * collection, so duplicates are not created.
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
  serverTimestamp,
} from 'firebase/firestore';

// ── Load .env manually (no dotenv dependency) ────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, '..', '.env');
const envText   = readFileSync(envPath, 'utf-8');
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

console.log('▸ Connecting to project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Load guest list ──────────────────────────────────────────────────────
const guestsPath = resolve(__dirname, '..', 'guests.json');
const guests     = JSON.parse(readFileSync(guestsPath, 'utf-8'));
console.log(`▸ Loaded ${guests.length} guests from guests.json`);

// ── Skip-existing check (so re-runs are idempotent) ──────────────────────
const existingSnap  = await getDocs(collection(db, 'guests'));
const existingNames = new Set(existingSnap.docs.map(d => (d.data().name || '').toLowerCase()));
console.log(`▸ Found ${existingNames.size} existing guests in Firestore`);

const toInsert = guests.filter(g => !existingNames.has(g.name.toLowerCase()));
console.log(`▸ Inserting ${toInsert.length} new guests (skipping ${guests.length - toInsert.length} duplicates)`);

if (toInsert.length === 0) {
  console.log('✓ Nothing to do.');
  process.exit(0);
}

// ── Batched writes (Firestore limit: 500 ops per batch) ──────────────────
const BATCH_SIZE = 400;
let written = 0;

for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
  const chunk = toInsert.slice(i, i + BATCH_SIZE);
  const batch = writeBatch(db);
  for (const guest of chunk) {
    const ref = doc(collection(db, 'guests'));
    batch.set(ref, {
      ...guest,
      createdAt:   serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });
  }
  await batch.commit();
  written += chunk.length;
  console.log(`  ✓ committed batch (${written}/${toInsert.length})`);
}

console.log(`\n✓ Done — wrote ${written} guests to project "${firebaseConfig.projectId}".`);
process.exit(0);
