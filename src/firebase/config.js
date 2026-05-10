// ============================================================
// Firebase Configuration — Wedding 3 (Yves & Grace)
// All sensitive values are loaded from environment variables.
// Copy .env.example to .env and fill in your Firebase project
// credentials before running the app.
//
// If no credentials are present (e.g. local preview without a
// Firebase project), the app renders gracefully — RSVP and
// Admin show placeholder states instead of crashing.
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';
import { getAuth }        from 'firebase/auth';

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Only initialise Firebase when credentials are actually present
export const isFirebaseConfigured = Boolean(apiKey && projectId);

let db   = null;
let auth = null;

if (isFirebaseConfigured) {
  const app = initializeApp({
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });
  db   = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
