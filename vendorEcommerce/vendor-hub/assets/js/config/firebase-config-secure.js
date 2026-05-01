/**
 * firebase-config-secure.js
 *
 * Secure Firebase initialisation for VendorHub.
 * Reads credentials from window.__env (populated at build time by vercel-build.js)
 * instead of relying on hardcoded values.
 *
 * Migration guide
 * ───────────────
 * To switch your pages to this secure config:
 *   1. Add the __env.js script BEFORE any <script type="module"> tag:
 *        <script src="<relative-path>/assets/js/config/__env.js"></script>
 *   2. Update imports from:
 *        import { db, auth, storage } from "../config/firebase-config.js";
 *      to:
 *        import { db, auth, storage } from "../config/firebase-config-secure.js";
 *
 * See DEPLOYMENT.md for the full setup process.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ─── Read config from window.__env ──────────────────────────────────────────

const _env =
  (typeof window !== "undefined" && window.__env) ? window.__env : {};

const firebaseConfig = {
  apiKey:            _env.VITE_FIREBASE_API_KEY            || "",
  authDomain:        _env.VITE_FIREBASE_AUTH_DOMAIN        || "",
  projectId:         _env.VITE_FIREBASE_PROJECT_ID         || "",
  storageBucket:     _env.VITE_FIREBASE_STORAGE_BUCKET     || "",
  messagingSenderId: _env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId:             _env.VITE_FIREBASE_APP_ID             || "",
  measurementId:     _env.VITE_FIREBASE_MEASUREMENT_ID     || "",
};

if (!firebaseConfig.apiKey) {
  console.error(
    "[VendorHub] Firebase configuration is missing.\n" +
    "  → In production: set environment variables on Vercel (see DEPLOYMENT.md).\n" +
    "  → Locally: create assets/js/config/__env.js from __env.local.example.js."
  );
}

// ─── Initialise Firebase ─────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth    = getAuth(app);
export const storage = getStorage(app);
