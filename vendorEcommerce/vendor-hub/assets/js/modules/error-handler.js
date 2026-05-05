/**
 * error-handler.js
 * Unified error handling with toast notifications and user-friendly messages.
 */

const ERROR_MESSAGES = {
  'permission-denied':      'You do not have permission to perform this action.',
  'not-found':              'The requested resource was not found.',
  'already-exists':         'This record already exists.',
  'unavailable':            'Service is temporarily unavailable. Please try again.',
  'network-request-failed': 'Network error. Please check your connection.',
  'too-many-requests':      'Too many requests. Please wait a moment.',
  'unauthenticated':        'Please log in to continue.',
  'deadline-exceeded':      'Request timed out. Please try again.',
  'default':                'An unexpected error occurred. Please try again.'
};

let toastContainer = null;

function getOrCreateToastContainer() {
  if (!toastContainer || !document.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed; top: 1rem; right: 1rem; z-index: 9999;
      display: flex; flex-direction: column; gap: 0.5rem;
      max-width: 380px; width: calc(100% - 2rem);
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn  { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(110%); opacity: 0; } }
      `;
      document.head.appendChild(style);
    }
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 4000) {
  const container = getOrCreateToastContainer();
  const toast = document.createElement('div');

  const icons  = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#00d2ff' };
  const color  = colors[type] || colors.info;
  const icon   = icons[type]  || icons.info;

  toast.style.cssText = `
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: rgba(17,19,24,0.97);
    border: 1px solid ${color}30;
    border-left: 3px solid ${color};
    border-radius: 10px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    color: #fff; font-size: 0.875rem; line-height: 1.4;
    animation: slideIn 0.3s ease forwards;
    cursor: pointer; pointer-events: all;
  `;

  toast.innerHTML = `
    <span style="color:${color};font-weight:700;font-size:1rem;flex-shrink:0;">${icon}</span>
    <span style="flex:1;">${message}</span>
    <span style="color:#666;font-size:1.25rem;line-height:1;cursor:pointer;flex-shrink:0;"
      onclick="this.parentElement.remove()">×</span>
  `;

  container.appendChild(toast);

  const dismiss = () => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  };

  const timer = setTimeout(dismiss, duration);
  toast.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}

export function getUserFriendlyError(error) {
  if (!error) return ERROR_MESSAGES.default;
  const raw = error.code || '';
  const key = raw.replace('auth/', '').replace('firestore/', '');
  return ERROR_MESSAGES[key] || error.message || ERROR_MESSAGES.default;
}

export function handleError(error, context = '') {
  const message = getUserFriendlyError(error);
  console.error(`[VendorHub${context ? ':' + context : ''}]`, error);
  showToast(message, 'error');
  return message;
}

export function showSuccess(message) { showToast(message, 'success'); }
export function showWarning(message) { showToast(message, 'warning'); }
export function showInfo(message)    { showToast(message, 'info');    }

export function setLoadingState(button, isLoading, loadingText = 'Loading...') {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent          = loadingText;
    button.disabled             = true;
    button.style.opacity        = '0.7';
  } else {
    button.textContent   = button.dataset.originalText || 'Submit';
    button.disabled      = false;
    button.style.opacity = '1';
  }
}
