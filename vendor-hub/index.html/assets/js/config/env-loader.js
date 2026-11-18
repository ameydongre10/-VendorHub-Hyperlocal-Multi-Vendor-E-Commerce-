/**
 * env-loader.js
 *
 * Unified environment-variable accessor for VendorHub.
 *
 * How values get populated:
 *   Production (Vercel)  – vercel-build.js generates dist/assets/js/config/__env.js
 *                          which sets window.__env before any module is imported.
 *   Local development    – copy __env.local.example.js → assets/js/config/__env.js
 *                          and fill in your values (the file is git-ignored).
 *
 * Usage:
 *   import { getEnv } from "./env-loader.js";
 *   const apiKey = getEnv("VITE_FIREBASE_API_KEY");
 */

/**
 * Returns the value of an environment variable, or an empty string if not set.
 * @param {string} key  – e.g. "VITE_FIREBASE_API_KEY"
 * @returns {string}
 */
export function getEnv(key) {
  if (typeof window !== 'undefined' && window.__env && key in window.__env) {
    return window.__env[key];
  }
  return '';
}

/**
 * Returns true when all required Firebase variables are present.
 */
export function isFirebaseConfigured() {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];
  return required.every((k) => Boolean(getEnv(k)));
}
