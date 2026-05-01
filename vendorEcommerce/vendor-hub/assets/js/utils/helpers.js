/**
 * helpers.js
 * Utility functions: currency formatting, dates, strings.
 */

/**
 * Formats a number as a USD currency string.
 * @param {number} amount
 * @returns {string} e.g. "$12.99"
 */
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Formats an ISO date string to a readable format.
 * @param {string} isoString
 * @returns {string} e.g. "May 1, 2026"
 */
export const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
};

/**
 * Truncates a string to a maximum length, appending "…".
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export const truncate = (str, max = 60) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max).trimEnd() + '…' : str;
};

/**
 * Returns a status badge CSS class name.
 * @param {string} status
 * @returns {string}
 */
export const statusBadgeClass = (status) => {
    const map = {
        Placed:    'badge-info',
        Shipped:   'badge-warning',
        Delivered: 'badge-success',
        Cancelled: 'badge-danger',
        approved:  'badge-success',
        pending:   'badge-warning',
        rejected:  'badge-danger',
    };
    return map[status] || 'badge-info';
};

/**
 * Returns a placeholder image URL.
 * @param {number} w
 * @param {number} h
 * @returns {string}
 */
export const placeholderImg = (w = 300, h = 200) =>
    `https://placehold.co/${w}x${h}/0d1120/00d2ff?text=No+Image`;

/**
 * Debounces a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
