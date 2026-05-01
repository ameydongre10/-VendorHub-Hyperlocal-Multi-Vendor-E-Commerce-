# VendorHub – Vercel Deployment Guide

This guide explains how to deploy VendorHub to [Vercel](https://vercel.com) safely, without exposing Firebase credentials in source code.

---

## Overview

VendorHub is a static HTML/JS site. The build step (`vercel-build.js`) copies all files from `vendorEcommerce/vendor-hub/` into a `dist/` directory and injects a `__env.js` file generated from Vercel's environment variables.

```
Source:  vendorEcommerce/vendor-hub/
         └── assets/js/config/firebase-config.js   ← legacy (hardcoded, dev only)
         └── assets/js/config/firebase-config-secure.js  ← production-ready

Build:   node vercel-build.js
         └── copies vendorEcommerce/vendor-hub/ → dist/
         └── generates dist/assets/js/config/__env.js (from Vercel env vars)

Output:  dist/
```

---

## 0 – Prerequisites

- **Node.js ≥ 18** is required to run `vercel-build.js`. Verify with:
  ```bash
  node --version   # should print v18.x.x or higher
  ```
  Vercel's default Node.js version satisfies this requirement. If you are running the build locally, install Node.js 18 or later from [nodejs.org](https://nodejs.org).

---

## 1 – Import Your Project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. Leave **Framework Preset** as **Other**.
3. Set **Root Directory** to `.` (the repository root).
4. Set **Build Command** to `node vercel-build.js` (auto-detected from `vercel.json`).
5. Set **Output Directory** to `dist` (auto-detected from `vercel.json`).

---

## 2 – Add Environment Variables on Vercel

In **Project → Settings → Environment Variables**, add the following:

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | e.g. `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID (optional) |
| `VITE_GEMINI_API_KEY` | Google Gemini AI API Key |

Enable these variables for **Production**, **Preview**, and **Development** environments.

---

## 3 – Trigger a Deployment

After saving your environment variables, click **Redeploy** (or push a new commit). Vercel will:

1. Run `node vercel-build.js`
2. Copy all static files to `dist/`
3. Generate `dist/assets/js/config/__env.js` populated with your env var values
4. Serve `dist/` as a static site with SPA-style routing

---

## 4 – Local Development Setup

### Option A – Use the legacy config (quickest)

The original `firebase-config.js` still works locally without any extra setup.

### Option B – Use the secure config locally

1. Navigate to `vendorEcommerce/vendor-hub/assets/js/config/`.
2. Copy the example file:
   ```bash
   cp __env.local.example.js __env.js
   ```
3. Edit `__env.js` and replace placeholder values with your actual Firebase credentials.
4. The file is git-ignored, so it won't be committed.

### Option C – Run the build script locally

1. Copy `.env.local.example` → `.env.local` and fill in your values.
2. Run:
   ```bash
   # Load env vars and run the build
   export $(cat .env.local | xargs) && node vercel-build.js
   ```
3. Open `dist/index.html` in a browser (or use `npx serve dist`).

---

## 5 – Migrating to the Secure Config

To use `firebase-config-secure.js` in a page:

1. **Add the `__env.js` script tag** before any `<script type="module">` in the page's `<head>`:
   ```html
   <!-- Adjust the relative path depth to match the page location -->
   <script src="../../assets/js/config/__env.js"></script>
   ```

2. **Update the import** in your inline module script:
   ```js
   // Before
   import { db, auth, storage } from "../../assets/js/config/firebase-config.js";

   // After
   import { db, auth, storage } from "../../assets/js/config/firebase-config-secure.js";
   ```

> **Note:** Firebase web API keys are client-side public identifiers (not secrets). The actual security comes from [Firebase Security Rules](https://firebase.google.com/docs/rules). However, moving credentials to environment variables is best practice and prevents accidental exposure of other sensitive identifiers.

---

## 6 – File Reference

| File | Purpose |
|---|---|
| `vercel.json` | Vercel project configuration (build command, output dir, routing) |
| `vercel-build.js` | Build script: copies static files and injects env vars |
| `package.json` | Defines `build` / `vercel-build` npm scripts |
| `.env.example` | Template for required environment variable keys |
| `.env.local.example` | Template for local development (fill in real values) |
| `.gitignore` | Prevents committing `.env`, `dist/`, `node_modules/`, `__env.js` |
| `vendorEcommerce/vendor-hub/assets/js/config/env-loader.js` | JS utility to read `window.__env` values |
| `vendorEcommerce/vendor-hub/assets/js/config/firebase-config-secure.js` | Firebase init using env vars (no hardcoded keys) |
| `vendorEcommerce/vendor-hub/assets/js/config/__env.local.example.js` | Template to create a local `__env.js` |

---

## 7 – Troubleshooting

| Symptom | Fix |
|---|---|
| Blank page / 404 on sub-pages | Ensure `vercel.json` routes are in place; check Output Directory is `dist` |
| `Firebase configuration is missing` console error | Verify all `VITE_FIREBASE_*` env vars are set on Vercel and redeploy |
| `__env.js not found` locally | Run `node vercel-build.js` or create it from `__env.local.example.js` |
| CSS/JS assets return 404 | Check relative paths in HTML files match the depth from the site root |
