/**
 * error-handler.js
 * Centralized error management with user-friendly UI feedback.
 */

// ── Toast Notification System ──────────────────────────────────────────────

/**
 * Ensures the toast container exists in the DOM.
 * @returns {HTMLElement}
 */
function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Shows a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration - ms before auto-dismiss (default 4000)
 */
export const showToast = (message, type = 'info', duration = 4000) => {
    const icons = {
        success: '✓',
        error:   '✕',
        info:    'ℹ',
        warning: '⚠',
    };

    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon" style="font-size:1.1rem;font-weight:700;">${icons[type] || icons.info}</span>
        <span class="toast-message">${sanitize(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'none';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => toast.remove(), 350);
    }, duration);
};

// ── Inline Field Errors ────────────────────────────────────────────────────

/**
 * Shows a validation error below a form field.
 * @param {HTMLElement|string} fieldOrId - Element or element ID
 * @param {string} message
 */
export const showFieldError = (fieldOrId, message) => {
    const field = typeof fieldOrId === 'string' ? document.getElementById(fieldOrId) : fieldOrId;
    if (!field) return;

    clearFieldError(field);

    field.classList.add('is-invalid');
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
};

/**
 * Clears validation error for a field.
 * @param {HTMLElement|string} fieldOrId
 */
export const clearFieldError = (fieldOrId) => {
    const field = typeof fieldOrId === 'string' ? document.getElementById(fieldOrId) : fieldOrId;
    if (!field) return;

    field.classList.remove('is-invalid');
    const existing = field.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
};

// ── Loading / Button States ────────────────────────────────────────────────

/**
 * Sets a button into loading state.
 * @param {HTMLButtonElement} btn
 * @param {string} loadingText
 */
export const setButtonLoading = (btn, loadingText = 'Please wait...') => {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> ${sanitize(loadingText)}`;
};

/**
 * Resets a button from loading state.
 * @param {HTMLButtonElement} btn
 */
export const resetButton = (btn) => {
    btn.disabled = false;
    if (btn.dataset.originalText) {
        btn.innerHTML = btn.dataset.originalText;
        delete btn.dataset.originalText;
    }
};

// ── Loading Overlay ────────────────────────────────────────────────────────

let overlayEl = null;

/**
 * Shows a full-screen loading overlay.
 * @param {string} message
 */
export const showLoadingOverlay = (message = 'Loading...') => {
    if (overlayEl) return;
    overlayEl = document.createElement('div');
    overlayEl.className = 'loading-overlay';
    overlayEl.innerHTML = `
        <div class="spinner"></div>
        <span style="letter-spacing:2px;text-transform:uppercase;font-size:0.85rem;">${sanitize(message)}</span>
    `;
    document.body.appendChild(overlayEl);
};

/**
 * Hides the loading overlay.
 */
export const hideLoadingOverlay = () => {
    if (overlayEl) {
        overlayEl.remove();
        overlayEl = null;
    }
};

// ── Firebase / Firestore Error Mapping ────────────────────────────────────

const FIREBASE_ERROR_MAP = {
    'permission-denied':          'You do not have permission to perform this action.',
    'not-found':                  'The requested resource was not found.',
    'already-exists':             'This record already exists.',
    'unavailable':                'Service is temporarily unavailable. Please try again.',
    'cancelled':                  'The operation was cancelled.',
    'deadline-exceeded':          'The request timed out. Check your connection.',
    'resource-exhausted':         'Too many requests. Please slow down and try again.',
    'unauthenticated':            'You must be logged in to perform this action.',
    'failed-precondition':        'Operation rejected. Please refresh and try again.',
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password.',
    'auth/email-already-in-use':  'An account with this email already exists.',
    'auth/weak-password':         'Password must be at least 6 characters.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/too-many-requests':     'Too many attempts. Please try again later.',
    'auth/network-request-failed':'Network error. Check your internet connection.',
};

/**
 * Returns a human-friendly message for a Firebase/Firestore error.
 * @param {Error|{code:string,message:string}} error
 * @returns {string}
 */
export const getFriendlyError = (error) => {
    if (!error) return 'An unknown error occurred.';

    const code = error.code || '';

    if (FIREBASE_ERROR_MAP[code]) return FIREBASE_ERROR_MAP[code];

    // Strip Firebase prefix for a cleaner message
    const msg = (error.message || String(error))
        .replace(/^Firebase: /i, '')
        .replace(/\s*\(auth\/[^)]+\)\.?$/, '');

    return msg || 'An unexpected error occurred.';
};

/**
 * Handles an error: logs it, shows a toast, and returns the friendly message.
 * @param {Error} error
 * @param {string} [context] - Optional context label for console
 * @returns {string} friendly message
 */
export const handleError = (error, context = '') => {
    const friendly = getFriendlyError(error);
    console.error(`[VendorHub${context ? ':' + context : ''}]`, error);
    showToast(friendly, 'error');
    return friendly;
};

// ── Form Validation Helpers ────────────────────────────────────────────────

/**
 * Validates a set of fields and returns true if all pass.
 * @param {Array<{id:string, label:string, required?:boolean, minLength?:number, type?:string}>} rules
 * @returns {boolean}
 */
export const validateForm = (rules) => {
    let valid = true;

    rules.forEach(rule => {
        const el = document.getElementById(rule.id);
        if (!el) return;
        clearFieldError(el);

        const val = el.value.trim();

        if (rule.required && !val) {
            showFieldError(el, `${rule.label} is required.`);
            valid = false;
            return;
        }

        if (rule.minLength && val.length < rule.minLength) {
            showFieldError(el, `${rule.label} must be at least ${rule.minLength} characters.`);
            valid = false;
            return;
        }

        if (rule.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            showFieldError(el, `Please enter a valid email address.`);
            valid = false;
        }
    });

    return valid;
};

// ── Internal Utils ─────────────────────────────────────────────────────────

/**
 * Escapes HTML to prevent XSS in toast/error messages.
 * @param {string} str
 * @returns {string}
 */
function sanitize(str) {
    const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
}
