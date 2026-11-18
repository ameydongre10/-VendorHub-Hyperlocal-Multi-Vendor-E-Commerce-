/**
 * helpers.js
 *
 * Utility helpers for formatting, security, and UI notifications.
 */

/**
 * Formats a numeric amount as currency string ($X.XX).
 */
export const formatCurrency = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `$${num.toFixed(2)}`;
};

/**
 * Formats an ISO date string into a user-friendly local date.
 */
export const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return isoString;
    }
};

/**
 * Truncates text with an ellipsis if it exceeds maxLength.
 */
export const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

/**
 * Sanitizes an untrusted string to prevent XSS injection.
 */
export const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Displays a non-intrusive floating toast notification on the screen.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} duration
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    let container = document.getElementById('vh-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'vh-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const colors = {
        info: { bg: 'rgba(0, 210, 255, 0.95)', text: '#000', border: '#00f2fe' },
        success: { bg: 'rgba(34, 197, 94, 0.95)', text: '#fff', border: '#16a34a' },
        error: { bg: 'rgba(239, 68, 68, 0.95)', text: '#fff', border: '#dc2626' },
        warning: { bg: 'rgba(245, 158, 11, 0.95)', text: '#000', border: '#d97706' }
    };
    const c = colors[type] || colors.info;

    toast.style.cssText = `
        background: ${c.bg};
        color: ${c.text};
        border: 1px solid ${c.border};
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'Rajdhani', sans-serif;
        font-weight: 600;
        font-size: 1rem;
        letter-spacing: 0.5px;
        min-width: 240px;
        max-width: 380px;
        pointer-events: auto;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    toast.textContent = message;
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // Auto dismiss
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(15px)';
        setTimeout(() => toast.remove(), 350);
    }, duration);
};
