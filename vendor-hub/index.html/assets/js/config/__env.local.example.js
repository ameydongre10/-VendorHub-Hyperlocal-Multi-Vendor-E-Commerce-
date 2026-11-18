// __env.local.example.js
//
// LOCAL DEVELOPMENT ONLY – git-ignored
//
// Steps:
//   1. Copy this file:  cp __env.local.example.js __env.js
//   2. Replace every placeholder with your real Firebase values
//   3. This file is loaded by <script src="__env.js"> in each HTML page
//      (the build script adds this script tag automatically)
//
// NEVER commit __env.js to version control.

window.__env = {
  VITE_FIREBASE_API_KEY:              "your-api-key-here",
  VITE_FIREBASE_AUTH_DOMAIN:          "your-project-id.firebaseapp.com",
  VITE_FIREBASE_PROJECT_ID:           "your-project-id",
  VITE_FIREBASE_STORAGE_BUCKET:       "your-project-id.firebasestorage.app",
  VITE_FIREBASE_MESSAGING_SENDER_ID:  "your-sender-id",
  VITE_FIREBASE_APP_ID:               "1:your-sender-id:web:your-app-id",
  VITE_FIREBASE_MEASUREMENT_ID:       "G-XXXXXXXXXX",
  VITE_GEMINI_API_KEY:                "your-gemini-api-key-here"
};
