# VendorHub – Hyperlocal Multi-Vendor E-Commerce Platform

[![Tests](https://img.shields.io/badge/tests-147%20passed-success)](test-project.js)
[![Vercel Deployment](https://img.shields.io/badge/deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)
[![Firebase](https://img.shields.io/badge/database-Firestore%20Offline%20Cache-orange?logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-blue?logo=google)](https://deepmind.google/technologies/gemini/)

VendorHub is an ultra-modern, decentralized-style hyperlocal multi-vendor marketplace designed to bridge the gap between local micro-businesses and neighborhood consumers. The platform provides a robust three-tier architecture (Buyer, Seller, Admin) handling the entire retail lifecycle: AI-assisted product discovery, live cart and inventory synchronization, status-tracked fulfillment, and platform monetization analytics.

---

## 🌐 Live Hosting & Deployment

* **Production Hosting Surface**: [Vercel](https://vercel.com)
* **Live Deployment URL**: [https://vendor-hub-hyperlocal-multi-vendor-e-commerce-c47qmj4z5.vercel.app](https://vendor-hub-hyperlocal-multi-vendor-e-commerce-c47qmj4z5.vercel.app)
* **Repository**: [https://github.com/ameydongre10/-VendorHub-Hyperlocal-Multi-Vendor-E-Commerce-](https://github.com/ameydongre10/-VendorHub-Hyperlocal-Multi-Vendor-E-Commerce-)

### ⚙️ Vercel Dual-Root Compatibility
The project includes universal build scripts and configurations so that Vercel deploys cleanly regardless of dashboard configuration:
1. **Root Directory: `.`** (Repository Root): Builds via root `vercel.json` and `vercel-build.js` outputting to `dist/`.
2. **Root Directory: `vendorEcommerce`**: Builds via `vendorEcommerce/vercel.json` and `vendorEcommerce/vercel-build.js` outputting to `vendorEcommerce/dist/`.
3. **Clean URLs & Rewrites**: Enabled for aesthetic URLs without `.html` extensions.

---

## 🛠 Architectural Highlights

### 💎 Ultra-Modern UI/UX & Design Engineering
* **Cyber-Glass Obsidian Interface:** Dark-mode space obsidian theme with frosted glassmorphic elements and cyan/blue neon accents.
* **Responsive Light/Dark Mode:** Dynamic theme switcher (`[data-theme="dark"]` and `[data-theme="light"]`) with persistent user preference storage.
* **3D Cursor Parallax Physics:** Hardware-accelerated, clamped 3D card tilt that reacts organically to mouse coordinates on pointer-capable devices.
* **Real-Time Toast Telemetry:** Floating non-blocking feedback toasts for cart additions, stock updates, and authorization state changes.

### 📦 Three-Tier Role-Based Governance
* **🛍️ Buyer Marketplace (`/pages/buyer/shop.html`):**
  * Search, category filtering, and product details with high-resolution media.
  * Real-time shopping cart with quantity controls, stock caps, and local storage synchronization.
  * Live order progress stepper (`Placed` → `Dispatched` → `Delivered`) backed by Firestore snapshot listeners.
* **🏪 Merchant Terminal (`/pages/seller/dashboard.html`):**
  * Store analytics: gross sales, order count, and net earnings (after 10% platform fee).
  * Automated low-stock warning banners.
  * Instant inline inventory management and asset decommissioning.
  * Customer order processing with live status transitions.
* **🛡️ Admin Command Center (`/pages/admin/dashboard.html`):**
  * Merchant approval workflow (review, approve, or reject vendor applications).
  * Platform-wide economic analytics (gross platform volume, 10% take-rate, total orders, merchant and buyer counts).
  * Global order override controls.

### 🧠 Smart Integration & Offline Resilience
* **AI Smart Search:** Integrated with Google Gemini (`gemini-1.5-flash`) for dynamic semantic synonym and related category expansion with dictionary fallback.
* **Offline Resilience:** Cloud Firestore with persistent multi-tab cache configuration (`persistentLocalCache` & `persistentMultipleTabManager`).
* **Graceful Environment Fallbacks:** Automatic fallback between Vercel production environment variables (`window.__env`) and local development credentials.

---

## 📂 Project Structure

```
├── dist/                              # Vercel production build output
├── vendorEcommerce/
│   ├── package.json                   # Subfolder deployment config
│   ├── vercel.json                    # Subfolder Vercel routing
│   ├── vercel-build.js                # Subfolder build script
│   └── vendor-hub/
│       ├── index.html                 # Main Landing Page
│       ├── assets/
│       │   ├── css/
│       │   │   ├── style.css          # Design system & light/dark CSS variables
│       │   │   ├── auth.css           # Authentication portal styling
│       │   │   ├── dashboard.css      # Merchant & Admin dashboard layouts
│       │   │   └── components.css     # Product cards, search toolbar, steppers
│       │   └── js/
│       │       ├── main.js            # Landing page controller
│       │       ├── buyer-app.js       # Marketplace catalog & search logic
│       │       ├── seller-app.js      # Merchant helpers & controllers
│       │       ├── admin-app.js       # Admin verification & analytics controller
│       │       ├── config/
│       │       │   ├── firebase-config.js  # Firebase client with offline cache
│       │       │   ├── gemini-config.js    # Google Gemini API connector
│       │       │   └── env-loader.js       # Unified environment variable loader
│       │       ├── modules/
│       │       │   ├── auth.js        # Session, login, register, and RBAC
│       │       │   ├── products.js    # Firestore product catalog CRUD
│       │       │   ├── orders.js      # Order creation, status & stock decrements
│       │       │   ├── vendor.js      # Merchant stats & low stock queries
│       │       │   ├── admin.js       # Approvals & platform analytics
│       │       │   ├── cart.js        # Full cart lifecycle management
│       │       │   └── ai-service.js  # Semantic expansion & recommendations
│       │       └── utils/
│       │           ├── helpers.js     # Currency, date, XSS escapes & toasts
│       │           ├── parallax.js    # Clamped 3D tilt interaction
│       │           ├── theme-handler.js # Light/dark mode toggle engine
│       │           └── ui-render.js   # Reusable DOM card & state renderers
│       └── pages/
│           ├── auth/ (login.html, register.html)
│           ├── buyer/ (shop.html, product-details.html, cart.html, track-order.html, all-orders.html)
│           ├── seller/ (dashboard.html, add-product.html, inventory.html)
│           └── admin/ (dashboard.html, vendor-requests.html, analytics.html)
├── test-project.js                    # Automated verification test suite (147 assertions)
├── vercel-build.js                    # Production asset pipeline & env generator
├── vercel.json                        # Vercel deployment routes & clean URLs config
└── package.json
```

---

## 🧪 Verification & Test Suite

Run the automated verification suite to validate all 147 assertions across JavaScript syntax, module import graphs, and build pipelines:
```bash
npm test
# Or: node test-project.js
```

---

## 🚀 Local Development & Preview

### 1. Build Production Assets
```bash
npm run build
```

### 2. Run Local Server
```bash
npx serve dist
# Or open index.html directly in any browser
```

---

## ☁️ Vercel Deployment & Root Directory Configuration

The repository supports **zero-config multi-root deployment**. Whether your Vercel project is configured with:
1. **Default / Root (`.`)** — Standard repository root deployment.
2. **`vendor-hub/index.html`** — Compatibility shim directory (auto-resolves and builds).
3. **`vendor-hub`** — Direct hub root directory.
4. **`vendorEcommerce/vendor-hub`** — Monorepo source directory.

### Quick Settings Fix in Vercel Dashboard (Optional Best Practice):
1. Navigate to **Project Settings → General**.
2. Under **Root Directory**, click **Edit**.
3. Clear the field or set it to `./` (leave blank to use the repository root).
4. Click **Save** and trigger a **Redeploy**.

---

## ☁️ Environment Variables Configuration (Vercel)

Configure the following variables in **Vercel Project Settings → Environment Variables**:

| Variable | Description | Default Fallback |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Configured project key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `multivendorecommerce-62970.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firestore Project ID | `multivendorecommerce-62970` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage Bucket | `multivendorecommerce-62970.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | `653502733308` |
| `VITE_FIREBASE_APP_ID` | Web App ID | `1:653502733308:web:...` |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | Built-in offline semantic fallback |
