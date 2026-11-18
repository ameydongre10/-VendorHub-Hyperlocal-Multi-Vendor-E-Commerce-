/**
 * buyer-app.js
 *
 * Dedicated client-side controller for buyer marketplace views.
 */

import { getAllProducts } from "./modules/products.js";
import { addToCart, getCartCount } from "./modules/cart.js";
import { getSmartSearchKeywords } from "./modules/ai-service.js";
import { renderProductCard } from "./utils/ui-render.js";
import { showToast } from "./utils/helpers.js";

let cachedProducts = [];
let activeCategory = 'all';

/**
 * Initializes the marketplace shop grid, search bar, and category filters.
 */
export const initShop = async () => {
    const grid = document.getElementById('shop-product-grid');
    if (!grid) return;

    try {
        cachedProducts = await getAllProducts();
        renderFilteredProducts();
        initSearchAndCategories();
        updateNavbarCartBadge();

        // Listen for external cart changes
        window.addEventListener('vendorhub:cartUpdated', updateNavbarCartBadge);
    } catch (err) {
        console.error("Failed to initialize shop:", err);
        grid.innerHTML = `<p style="color:var(--danger)">Error loading marketplace products: ${err.message}</p>`;
    }
};

/**
 * Renders the products based on category, search filter, and sorting.
 */
export const renderFilteredProducts = (filterQuery = '') => {
    const grid = document.getElementById('shop-product-grid');
    if (!grid) return;

    let filtered = [...cachedProducts];

    // Filter by Category
    if (activeCategory && activeCategory !== 'all') {
        filtered = filtered.filter(p => 
            (p.category || '').toLowerCase() === activeCategory.toLowerCase()
        );
    }

    // Filter by Search Query
    if (filterQuery && filterQuery.trim()) {
        const q = filterQuery.toLowerCase().trim();
        filtered = filtered.filter(p => 
            (p.name || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.vendorName || '').toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state-box" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🔍</div>
                <h3>No Matching Assets Found</h3>
                <p>Try searching with another keyword or selecting a different category filter.</p>
                <button id="btn-reset-filters" class="empty-state-btn" style="cursor:pointer;">Clear Filters</button>
            </div>
        `;
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('shop-search-input');
                if (searchInput) searchInput.value = '';
                setActiveCategory('all');
            });
        }
        return;
    }

    grid.innerHTML = filtered.map(p => renderProductCard(p)).join('');

    // Attach Add to Cart listeners
    grid.querySelectorAll('.btn-card-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pId = btn.dataset.id;
            const product = cachedProducts.find(p => p.id === pId);
            if (product) {
                const res = addToCart(product, 1);
                if (res.success) {
                    showToast(`Added "${product.name}" to cart!`, "success", 2000);
                    updateNavbarCartBadge();
                } else {
                    showToast(res.error || "Could not add to cart", "warning");
                }
            }
        });
    });
};

/**
 * Sets active category and re-renders.
 */
export const setActiveCategory = (category) => {
    activeCategory = category;
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.dataset.category.toLowerCase() === category.toLowerCase()) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    const searchInput = document.getElementById('shop-search-input');
    renderFilteredProducts(searchInput ? searchInput.value : '');
};

/**
 * Connects category buttons, search inputs, and AI smart suggestions.
 */
const initSearchAndCategories = () => {
    const searchInput = document.getElementById('shop-search-input');
    const aiSearchBtn = document.getElementById('btn-ai-search');
    const suggestionsContainer = document.getElementById('ai-suggestions-container');

    // Category Tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveCategory(tab.dataset.category);
        });
    });

    // Real-time Search typing
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderFilteredProducts(searchInput.value);
        });
    }

    // AI Smart Search Trigger
    if (aiSearchBtn && searchInput) {
        aiSearchBtn.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (!query) {
                showToast("Enter a search term for AI keyword expansion", "info");
                return;
            }

            aiSearchBtn.innerHTML = `<span>⏳ Searching...</span>`;
            try {
                const keywords = await getSmartSearchKeywords(query);
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = 'flex';
                    suggestionsContainer.innerHTML = `
                        <span style="font-weight:700; color:var(--accent-primary);">AI Synonyms:</span>
                        ${keywords.map(k => `<button class="ai-chip" data-keyword="${k}">${k}</button>`).join('')}
                    `;

                    suggestionsContainer.querySelectorAll('.ai-chip').forEach(chip => {
                        chip.addEventListener('click', () => {
                            searchInput.value = chip.dataset.keyword;
                            renderFilteredProducts(chip.dataset.keyword);
                        });
                    });
                }
                renderFilteredProducts(query);
            } catch (e) {
                console.error("AI Smart Search error:", e);
            } finally {
                aiSearchBtn.innerHTML = `<span>✨ AI Smart Search</span>`;
            }
        });
    }
};

/**
 * Updates any cart badge elements on the page.
 */
export const updateNavbarCartBadge = () => {
    const count = getCartCount();
    document.querySelectorAll('.cart-badge, #navbar-cart-count').forEach(badge => {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    });
};
