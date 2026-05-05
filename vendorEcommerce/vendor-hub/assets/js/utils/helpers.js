/**
 * helpers.js
 * Utility functions for formatting, validation, and DOM operations.
 */

// ─── Currency & Numbers ───────────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num || 0);
}

// ─── Date & Time ─────────────────────────────────────────────────────────────
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
}

export function timeAgo(date) {
  const seconds   = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'],     [60, 'minute'],     [1, 'second']
  ];
  for (const [s, label] of intervals) {
    const count = Math.floor(seconds / s);
    if (count >= 1) return `${count} ${label}${count !== 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// ─── Validation ───────────────────────────────────────────────────────────────
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password) {
  return password && password.length >= 6;
}

export function sanitizeInput(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── String utils ─────────────────────────────────────────────────────────────
export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsAll(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if (typeof child === 'string') el.insertAdjacentHTML('beforeend', child);
    else el.appendChild(child);
  });
  return el;
}

export function showElement(el) { if (el) el.style.display = ''; }
export function hideElement(el) { if (el) el.style.display = 'none'; }

export function setHTML(selector, html, parent = document) {
  const el = parent.querySelector(selector);
  if (el) el.innerHTML = html;
}

export function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ─── Star rating ──────────────────────────────────────────────────────────────
export function renderStars(rating, max = 5) {
  return Array.from({ length: max }, (_, i) =>
    `<span style="color:${i < Math.round(rating) ? '#f59e0b' : '#374151'}">★</span>`
  ).join('');
}

// ─── Category icon ────────────────────────────────────────────────────────────
export function getCategoryIcon(category) {
  const icons = {
    electronics: '💻', food: '🍔', fashion: '👕', home: '🏠',
    beauty: '💄', sports: '⚽', books: '📚', toys: '🎮', default: '📦'
  };
  return icons[category?.toLowerCase()] || icons.default;
}

export function getStatusColor(status) {
  const colors = {
    'Placed':    '#00d2ff', 'Shipped':  '#f59e0b',
    'Delivered': '#10b981', 'Cancelled':'#ef4444',
    'pending':   '#f59e0b', 'approved': '#10b981', 'rejected': '#ef4444'
  };
  return colors[status] || '#a0aec0';
}
