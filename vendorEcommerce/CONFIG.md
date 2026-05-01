# VendorHub – Configuration & Troubleshooting Guide

## Quick Start

### Prerequisites
- A modern browser (Chrome, Firefox, Edge, Safari)
- A [Firebase](https://console.firebase.google.com/) project with **Firestore** and **Storage** enabled
- (Optional) An [ImageKit](https://imagekit.io/) account for product image hosting
- (Optional) A [Google Gemini](https://ai.google.dev/) API key for AI features

---

## 1. Firebase Setup

### 1.1 Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the wizard
3. Enable **Google Analytics** (optional)

### 1.2 Enable Firestore
1. In the Firebase console, go to **Build → Firestore Database**
2. Click **Create database** → choose **Production mode**
3. Select a region close to your users

### 1.3 Firestore Security Rules
Paste the following rules in **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only the user themselves can read/write their own doc
    match /users/{userId} {
      allow read, write: if true; // Relax for prototype; tighten for production
    }

    // Products: anyone can read; only authenticated sellers can write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if true; // Tighten before going live
    }

    // Orders: buyers can create; vendors and admins can update
    match /orders/{orderId} {
      allow read, write: if true; // Tighten before going live
    }
  }
}
```

> **Production note:** Replace `if true` with proper authentication checks once you integrate Firebase Auth.

### 1.4 Configure the App
Open `vendor-hub/assets/js/config/firebase-config.js` and replace the placeholder config object with your project's credentials (found in **Project Settings → Your apps → Web app**).

```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

---

## 2. ImageKit Setup (Product Images)

1. Sign up at [imagekit.io](https://imagekit.io/)
2. Copy your **Private API Key** from **Developer options → API Keys**
3. Open `vendor-hub/assets/js/modules/products.js`
4. Replace the `IMAGEKIT_PRIVATE_KEY` constant with your key

> ⚠️ **Security warning:** Exposing your ImageKit private key client-side is insecure in production. For a production app, proxy the upload through a server-side function (Firebase Cloud Functions, Vercel Edge Function, etc.).

---

## 3. Running the App Locally

Because the app uses ES Modules (`type="module"`), you **cannot** open HTML files directly with `file://`. You need a local HTTP server.

### Option A: VS Code Live Server
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `vendor-hub/index.html` → **Open with Live Server**

### Option B: Python
```bash
cd vendorEcommerce/vendor-hub
python3 -m http.server 8080
# Open http://localhost:8080
```

### Option C: Node.js `http-server`
```bash
npm install -g http-server
cd vendorEcommerce/vendor-hub
http-server -p 8080
```

---

## 4. Deploying to Vercel

The project already includes `vendorEcommerce/vercel.json`. To deploy:

```bash
npm install -g vercel
cd vendorEcommerce
vercel
```

Follow the prompts. Vercel will serve the static files automatically.

---

## 5. Common Errors & Fixes

### `FirebaseError: [code=permission-denied]`
**Cause:** Firestore security rules are blocking the operation.
**Fix:** Update your Firestore rules (see Section 1.3 above) to allow reads/writes.

### `CORS error` when uploading images
**Cause:** ImageKit private key used client-side may hit CORS headers.
**Fix:** Use a server-side proxy or upgrade to ImageKit's authenticated upload URL.

### `FirebaseError: [code=unavailable]`
**Cause:** Network connectivity issue or Firestore is temporarily down.
**Fix:** Check your internet connection. The app uses persistent caching, so existing data should still be visible offline.

### Products not appearing in shop
**Cause:** Firestore `products` collection is empty, or security rules deny reads.
**Fix:**
1. Check Firestore rules allow public reads on `/products`.
2. Log in as a seller and add at least one product via **Seller Dashboard → Add Product**.

### Login always fails with "Invalid email or password"
**Cause:** The auth module uses a custom Firestore-based auth (not Firebase Auth). Passwords are stored as plaintext in Firestore documents.
**Fix:** Register a new account first, then log in with the same credentials.
**Recommended for production:** Migrate to Firebase Authentication for secure, hashed passwords.

### Blank page / white screen
**Cause:** Usually a JavaScript module import error.
**Fix:**
1. Open browser DevTools → Console
2. Look for `404 Not Found` or `SyntaxError` messages
3. Ensure you're serving via HTTP (not `file://`)

---

## 6. Project Structure

```
vendorEcommerce/
├── vendor-hub/
│   ├── index.html                   # Landing page
│   ├── assets/
│   │   ├── css/
│   │   │   ├── design-system.css    # Design tokens, base styles
│   │   │   ├── responsive.css       # Mobile-first layout
│   │   │   ├── style.css            # Legacy global styles
│   │   │   ├── auth.css             # Auth page styles (legacy)
│   │   │   ├── dashboard.css        # Dashboard styles (legacy)
│   │   │   └── components.css       # Component styles (legacy)
│   │   └── js/
│   │       ├── config/
│   │       │   ├── firebase-config.js   # Firebase initialization
│   │       │   └── gemini-config.js     # Gemini AI setup
│   │       ├── modules/
│   │       │   ├── api-service.js       # Centralized Firestore calls
│   │       │   ├── error-handler.js     # Error management & UI feedback
│   │       │   ├── auth.js              # Login/Register/Logout
│   │       │   ├── products.js          # Product CRUD + image upload
│   │       │   ├── orders.js            # Order management
│   │       │   ├── vendor.js            # Vendor-specific queries
│   │       │   ├── admin.js             # Admin queries
│   │       │   ├── cart.js              # Cart (localStorage)
│   │       │   └── ai-service.js        # Gemini AI integration
│   │       └── utils/
│   │           ├── helpers.js           # Currency, date, string utils
│   │           ├── ui-render.js         # DOM rendering helpers
│   │           ├── parallax.js          # 3D tilt effects
│   │           └── theme-handler.js     # Dark/light theme toggle
│   └── pages/
│       ├── auth/       login.html, register.html
│       ├── buyer/      shop.html, product-details.html, cart.html, track-order.html
│       ├── seller/     dashboard.html, add-product.html, inventory.html
│       └── admin/      dashboard.html, vendor-requests.html, analytics.html
├── .env.example        # Environment variable template
└── vercel.json         # Vercel deployment config
```

---

## 7. Security Checklist (Before Production)

- [ ] Replace Firestore security rules (`if true`) with proper auth-based rules
- [ ] Move ImageKit private key to a server-side function
- [ ] Migrate from custom Firestore auth to **Firebase Authentication**
- [ ] Store Gemini API key server-side
- [ ] Enable Firebase App Check
- [ ] Set up HTTPS (handled automatically by Vercel/Firebase Hosting)
- [ ] Review and restrict Firestore indexes
