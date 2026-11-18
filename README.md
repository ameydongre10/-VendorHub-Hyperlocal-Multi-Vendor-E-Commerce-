# VendorHub – Hyperlocal Multi-Vendor E-Commerce Platform

VendorHub is an ultra-modern, decentralized-style hyperlocal multi-vendor marketplace designed to bridge the gap between local micro-businesses and neighborhood consumers. The platform provides a robust three-tier architecture (Buyer, Seller, Admin) handling the entire retail lifecycle: AI-assisted product discovery, live cart and inventory synchronization, status-tracked fulfillment, and platform monetization analytics.

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

## 🚀 Getting Started

### 1. Run Verification Suite
Verify all JavaScript syntax, module imports, and build scripts:
```bash
npm test
# Or: node test-project.js
```

### 2. Local Development
To serve the application locally:
```bash
# Build the production bundle
npm run build

# Serve the dist/ directory or open directly in your browser
npx serve dist
```

### 3. Deploy to Vercel
1. Push your repository to GitHub.
2. Import project into Vercel (Root Directory: `.`).
3. Set optional environment variables in Vercel Project Settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_GEMINI_API_KEY`
4. Deploy!
