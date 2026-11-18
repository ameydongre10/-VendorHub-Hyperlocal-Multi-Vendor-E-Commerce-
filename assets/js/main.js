import { checkAuthState, logoutUser } from "./modules/auth.js";
import { initTheme, toggleTheme } from "./utils/theme-handler.js";
import { initParallax } from "./utils/parallax.js";
import { getCartCount } from "./modules/cart.js";

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initParallax();

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Update cart badge if present
    const cartBadge = document.getElementById('navbar-cart-count');
    if (cartBadge) {
        const count = getCartCount();
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // Dynamic Navigation Auth State
    const authContainer = document.getElementById('auth-action-container');
    const heroCtaContainer = document.getElementById('hero-cta-container');

    checkAuthState((user) => {
        if (user) {
            if (authContainer) {
                authContainer.innerHTML = `
                    <span style="font-size:0.9rem; color:var(--text-muted); margin-right:8px;">Welcome, ${user.name || 'User'}</span>
                    <button id="logout-btn" style="background:transparent; border:none; color:var(--danger); font-weight:700; cursor:pointer; font-size:0.85rem;">Logout</button>
                `;
                document.getElementById('logout-btn').addEventListener('click', () => {
                    logoutUser().then(() => window.location.reload());
                });
            }

            if (heroCtaContainer) {
                let portalLink = "pages/buyer/shop.html";
                let portalLabel = "🛍️ Enter Market";
                if (user.role === 'seller') {
                    portalLink = "pages/seller/dashboard.html";
                    portalLabel = "📦 Merchant Terminal";
                } else if (user.role === 'admin') {
                    portalLink = "pages/admin/dashboard.html";
                    portalLabel = "📊 Admin Command";
                }

                heroCtaContainer.innerHTML = `
                    <a href="${portalLink}" class="btn-primary" style="padding:14px 28px; font-size:0.95rem;">${portalLabel}</a>
                    <a href="pages/buyer/shop.html" class="btn-secondary" style="padding:14px 28px; font-size:0.95rem;">Browse Local Shop</a>
                `;
            }
        } else {
            if (authContainer) {
                authContainer.innerHTML = `
                    <a href="pages/auth/login.html" class="btn-primary" style="padding:6px 14px; font-size:0.8rem;">Login</a>
                `;
            }
        }
    });
});
