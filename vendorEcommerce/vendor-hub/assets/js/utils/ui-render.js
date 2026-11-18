/**
 * ui-render.js
 *
 * Reusable HTML template generators for VendorHub frontend.
 */

import { formatCurrency, escapeHtml, truncateText } from "./helpers.js";

/**
 * Generates markup for an interactive product card.
 */
export const renderProductCard = (product) => {
    const pId = escapeHtml(product.id);
    const pName = escapeHtml(product.name || 'Unnamed Asset');
    const pDesc = escapeHtml(truncateText(product.description || '', 85));
    const pCategory = escapeHtml(product.category || 'General');
    const pVendor = escapeHtml(product.vendorName || 'Local Vendor');
    const pImage = product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
    const priceFormatted = formatCurrency(product.price);
    const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock, 10) || 0;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 5;

    let stockBadge = `<span class="badge badge-stock in-stock">In Stock (${stock})</span>`;
    if (isOutOfStock) {
        stockBadge = `<span class="badge badge-stock out-of-stock">Depleted</span>`;
    } else if (isLowStock) {
        stockBadge = `<span class="badge badge-stock low-stock">Low Stock (${stock})</span>`;
    }

    return `
        <div class="product-card" data-id="${pId}">
            <div class="product-image-wrap">
                <img src="${escapeHtml(pImage)}" alt="${pName}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'">
                <span class="category-tag">${pCategory}</span>
            </div>
            <div class="product-card-body">
                <div class="vendor-tag">Vendor: ${pVendor}</div>
                <h4 title="${pName}">${pName}</h4>
                <p class="product-desc">${pDesc}</p>
                <div class="product-card-meta">
                    <span class="product-price">${priceFormatted}</span>
                    ${stockBadge}
                </div>
                <div class="product-card-actions">
                    <a href="product-details.html?id=${pId}" class="btn-card-details">Details</a>
                    <button 
                        class="btn-card-add-cart" 
                        data-id="${pId}" 
                        ${isOutOfStock ? 'disabled title="Out of stock"' : ''}>
                        ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Generates an empty state placeholder.
 */
export const renderEmptyState = (title, message, ctaLink = '', ctaText = '') => {
    return `
        <div class="empty-state-box">
            <div class="empty-state-icon">📦</div>
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
            ${ctaLink ? `<a href="${escapeHtml(ctaLink)}" class="empty-state-btn">${escapeHtml(ctaText)}</a>` : ''}
        </div>
    `;
};
