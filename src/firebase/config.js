// ============================================================
// Firebase Configuration — Wedding 3 (Yves & Grace)
// All sensitive values are loaded from environment variables.
// Copy .env.example to .env and fill in your Firebase project
// credentials before running the app.
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore }   from 'firebase/firestore';
import { getAuth }        from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
