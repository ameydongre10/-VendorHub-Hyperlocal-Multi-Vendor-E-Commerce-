import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Read environment variables if available (from window.__env injected at build time)
const _env = (typeof window !== "undefined" && window.__env) ? window.__env : {};

const firebaseConfig = {
  apiKey:            _env.VITE_FIREBASE_API_KEY            || "AIzaSyBsTdcC2fA40UDfBmb99awXm_CCAx065U8",
  authDomain:        _env.VITE_FIREBASE_AUTH_DOMAIN        || "multivendorecommerce-62970.firebaseapp.com",
  projectId:         _env.VITE_FIREBASE_PROJECT_ID         || "multivendorecommerce-62970",
  storageBucket:     _env.VITE_FIREBASE_STORAGE_BUCKET     || "multivendorecommerce-62970.firebasestorage.app",
  messagingSenderId: _env.VITE_FIREBASE_MESSAGING_SENDER_ID || "653502733308",
  appId:             _env.VITE_FIREBASE_APP_ID             || "1:653502733308:web:37c4c8c1c6b432b6427079",
  measurementId:     _env.VITE_FIREBASE_MEASUREMENT_ID     || "G-KF3G304RJV"
};

// 1. Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with Persistence (ONLY ONCE)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// 3. Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);
