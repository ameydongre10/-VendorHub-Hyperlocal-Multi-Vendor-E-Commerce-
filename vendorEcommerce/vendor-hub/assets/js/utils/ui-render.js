/**
 * ui-render.js
 * Functions for injecting reusable HTML components into the DOM.
 */

import { formatCurrency, formatDate, statusBadgeClass, placeholderImg, truncate } from './helpers.js';

/**
 * Renders a product card HTML string.
 * @param {object} product
 * @param {object} [options]
 * @param {boolean} [options.showDelete] - Show delete button (seller view)
 * @param {boolean} [options.showAddToCart] - Show add-to-cart button (buyer view)
 * @returns {string} HTML string
 */
export const renderProductCard = (product, options = {}) => {
    const { showDelete = false, showAddToCart = true } = options;
    const imgSrc = product.image || placeholderImg();

    const deleteBtn = showDelete
        ? `<button class="btn btn-danger btn-sm w-full" onclick="handleDelete('${product.id}')">Remove</button>`
        : '';

    const cartBtn = showAddToCart
        ? `<button class="btn btn-primary btn-sm" style="flex:1" onclick="addProductToCart('${product.id}')">Add to Cart</button>`
        : '';

    const detailBtn = `<a href="product-details.html?id=${product.id}" class="btn btn-outline btn-sm" style="flex:1">View</a>`;

    return `
        <div class="product-card animate-in" data-product-id="${product.id}">
            <img src="${imgSrc}" alt="${escHtml(product.name)}" loading="lazy"
                 onerror="this.src='${placeholderImg()}'">
            <div class="product-card-body">
                <div class="product-card-title">${escHtml(product.name)}</div>
                <div class="product-card-price">${formatCurrency(product.price)}</div>
                <div class="product-card-vendor">by ${escHtml(product.vendorName || 'Local Vendor')}</div>
                <div class="product-card-actions">
                    ${detailBtn}
                    ${cartBtn}
                    ${deleteBtn}
                </div>
            </div>
        </div>`;
};

/**
 * Renders a list of product cards into a container element.
 * @param {HTMLElement} container
 * @param {Array}       products
 * @param {object}      [options]
 */
export const renderProductGrid = (container, products, options = {}) => {
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="empty-icon">📦</div>
                <p>No products found.</p>
            </div>`;
        return;
    }

    container.innerHTML = products.map(p => renderProductCard(p, options)).join('');
};

/**
 * Renders an order card HTML string.
 * @param {object}  order
 * @param {boolean} [showStatusSelect] – Show status dropdown
 * @param {string}  [onChangeHandler]  – JS function name for onchange
 * @returns {string}
 */
export const renderOrderCard = (order, showStatusSelect = false, onChangeHandler = 'changeStatus') => {
    const statuses = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];
    const options = statuses.map(s =>
        `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const statusEl = showStatusSelect
        ? `<select class="form-control" style="width:auto;padding:8px 12px;"
               onchange="${onChangeHandler}('${order.id}', this.value)">${options}</select>`
        : `<span class="badge ${statusBadgeClass(order.status)}">${escHtml(order.status)}</span>`;

    return `
        <div class="order-card animate-in">
            <div>
                <strong style="color:#fff">Order #${escHtml(order.id.slice(-6).toUpperCase())}</strong>
                <span style="display:block;font-size:0.8rem;color:var(--text-muted);margin-top:2px;">
                    ${formatDate(order.createdAt)}
                </span>
                <span style="display:block;font-size:0.9rem;color:var(--accent-primary);margin-top:4px;">
                    ${formatCurrency(order.totalAmount)}
                </span>
            </div>
            ${statusEl}
        </div>`;
};

/**
 * Renders an inventory row HTML string.
 * @param {object} product
 * @returns {string}
 */
export const renderInventoryRow = (product) => {
    const stockClass = product.stock < 5 ? 'style="color:var(--danger);font-weight:700"' : '';
    return `
        <div class="inventory-row animate-in">
            <div style="display:flex;align-items:center;gap:10px;">
                <img src="${product.image || placeholderImg(40,40)}"
                     style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid var(--glass-border);"
                     onerror="this.src='${placeholderImg(40,40)}'">
                <span style="font-weight:600;color:#fff">${escHtml(product.name)}</span>
            </div>
            <span style="color:var(--accent-primary);font-weight:700">${formatCurrency(product.price)}</span>
            <span ${stockClass}>${product.stock} units</span>
            <div>
                <button class="btn btn-danger btn-sm" onclick="handleDelete('${product.id}')">Remove</button>
            </div>
        </div>`;
};

/**
 * Shows a skeleton loading placeholder inside a container.
 * @param {HTMLElement} container
 * @param {number}      count – Number of skeleton cards
 */
export const showSkeleton = (container, count = 6) => {
    if (!container) return;
    container.innerHTML = Array.from({ length: count }).map(() => `
        <div style="background:var(--glass-fill);border:1px solid var(--glass-border);
                    border-radius:var(--radius-md);overflow:hidden;animation:pulseGlow 1.5s infinite;">
            <div style="height:200px;background:rgba(255,255,255,0.04);"></div>
            <div style="padding:16px;">
                <div style="height:14px;background:rgba(255,255,255,0.06);border-radius:4px;margin-bottom:10px;"></div>
                <div style="height:18px;background:rgba(0,210,255,0.08);border-radius:4px;width:60%;margin-bottom:14px;"></div>
                <div style="height:34px;background:rgba(255,255,255,0.04);border-radius:6px;"></div>
            </div>
        </div>`).join('');
};

// ── Internal Helper ───────────────────────────────────────────────────────

const escHtml = (str) => {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
    return String(str || '').replace(/[&<>"']/g, c => map[c]);
};
