/**
 * ui-render.js
 * DOM rendering helpers and template functions for consistent UI components.
 */

import { formatCurrency, formatDate, truncate, getCategoryIcon, getStatusColor, renderStars } from './helpers.js';

// ─── Loading State ────────────────────────────────────────────────────────────
export function renderLoading(container, message = 'Loading...') {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:3rem;color:#4a5568;">
      <div style="width:40px;height:40px;border:3px solid rgba(0,210,255,0.15);
        border-top-color:#00d2ff;border-radius:50%;animation:spin 0.8s linear infinite;
        margin:0 auto 1rem;"></div>
      <p>${message}</p>
    </div>`;
  if (!document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function renderEmpty(container, message = 'No items found', icon = '📭', actionHtml = '') {
  if (typeof container === 'string') container = document.querySelector(container);
  if (!container) return;
  container.innerHTML = `
    <div style="text-align:center;padding:3rem;color:#4a5568;">
      <div style="font-size:3.5rem;margin-bottom:1rem;">${icon}</div>
      <p style="font-size:1.1rem;margin-bottom:1rem;">${message}</p>
      ${actionHtml}
    </div>`;
}

// ─── Product Card ─────────────────────────────────────────────────────────────
export function renderProductCard(product) {
  const imgSrc = product.image ||
    `https://placehold.co/300x200/111318/00d2ff?text=${encodeURIComponent(product.name || 'Product')}`;
  return `
    <div class="product-card" data-id="${product.id}" style="
      background:rgba(17,19,24,0.85); border:1px solid rgba(0,210,255,0.1);
      border-radius:16px; overflow:hidden; cursor:pointer;
      transition:transform .3s,box-shadow .3s,border-color .3s;">
      <div style="position:relative;height:200px;overflow:hidden;">
        <img src="${imgSrc}" alt="${product.name}"
          style="width:100%;height:100%;object-fit:cover;transition:transform .3s;"
          onerror="this.src='https://placehold.co/300x200/111318/00d2ff?text=No+Image'">
        <div style="position:absolute;top:.5rem;right:.5rem;">
          <span style="background:rgba(0,210,255,0.15);color:#00d2ff;
            border:1px solid rgba(0,210,255,0.3);
            padding:.2rem .55rem;border-radius:20px;font-size:.72rem;">
            ${getCategoryIcon(product.category)} ${product.category || 'General'}
          </span>
        </div>
      </div>
      <div style="padding:1.25rem;">
        <h3 style="font-size:.95rem;font-weight:600;color:#fff;margin-bottom:.4rem;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${product.name || 'Unnamed Product'}
        </h3>
        <p style="font-size:.78rem;color:#a0aec0;margin-bottom:1rem;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
          ${product.description || 'No description available'}
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:1.1rem;font-weight:700;
            background:linear-gradient(135deg,#00d2ff,#3a7bd5);
            -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            ${formatCurrency(product.price)}
          </span>
          <span style="font-size:.72rem;color:${product.stock > 0 ? '#10b981' : '#ef4444'}">
            ${product.stock > 0 ? `✓ ${product.stock} in stock` : '✕ Out of stock'}
          </span>
        </div>
        <button class="add-to-cart-btn" data-id="${product.id}"
          style="width:100%;margin-top:.875rem;padding:.55rem;
          background:linear-gradient(135deg,#00d2ff,#3a7bd5);
          color:#fff;border:none;border-radius:8px;font-weight:600;
          cursor:pointer;transition:.2s;
          ${product.stock <= 0 ? 'opacity:.5;cursor:not-allowed;' : ''}"
          ${product.stock <= 0 ? 'disabled' : ''}>
          ${product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>`;
}

// ─── Order Row ────────────────────────────────────────────────────────────────
export function renderOrderRow(order) {
  const color = getStatusColor(order.status);
  return `
    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
      <td style="padding:.75rem 1rem;font-family:monospace;color:#00d2ff">
        #${(order.id || '').slice(-6).toUpperCase()}
      </td>
      <td style="padding:.75rem 1rem;color:#a0aec0">${formatDate(order.createdAt)}</td>
      <td style="padding:.75rem 1rem;font-weight:600">${formatCurrency(order.totalAmount)}</td>
      <td style="padding:.75rem 1rem;">
        <span style="background:${color}22;color:${color};
          border:1px solid ${color}44;
          padding:.2rem .65rem;border-radius:20px;font-size:.78rem;">
          ${order.status}
        </span>
      </td>
    </tr>`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function renderStatCard(icon, label, value, color = '#00d2ff', trend = null) {
  return `
    <div style="background:rgba(17,19,24,0.8);border:1px solid rgba(255,255,255,0.07);
      border-radius:16px;padding:1.5rem;text-align:center;
      backdrop-filter:blur(20px);">
      <div style="font-size:2rem;margin-bottom:.5rem;">${icon}</div>
      <p style="font-size:.72rem;color:#4a5568;text-transform:uppercase;
        letter-spacing:1px;margin-bottom:.5rem;">${label}</p>
      <p style="font-size:1.75rem;font-weight:700;color:${color};">${value}</p>
      ${trend !== null ? `
        <p style="font-size:.72rem;color:${trend >= 0 ? '#10b981' : '#ef4444'};margin-top:.25rem;">
          ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% from last month
        </p>` : ''}
    </div>`;
}

// ─── Re-export toast helpers from error-handler ───────────────────────────────
export { showToast, showSuccess, showWarning, showInfo, handleError, setLoadingState }
  from '../modules/error-handler.js';
