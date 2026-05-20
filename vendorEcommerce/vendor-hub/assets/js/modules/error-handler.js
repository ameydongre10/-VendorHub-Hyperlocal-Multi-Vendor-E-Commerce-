/**
 * Unified Error Handler
 * Centralized error management with user-friendly messages
 */

class ErrorHandler {
  static show(message, type = 'error', duration = 5000) {
    const id = `error-${Date.now()}`;
    const html = `
      <div id="${id}" class="alert alert-${type}" role="alert">
        <p>${message}</p>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
      </div>
    `;

    const container = document.querySelector('.notification-container') || this.createContainer();
    container.insertAdjacentHTML('beforeend', html);

    if (duration > 0) {
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.remove();
      }, duration);
    }
  }

  static showSuccess(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  static showError(error, duration = 5000) {
    const message = this.getErrorMessage(error);
    this.show(message, 'error', duration);
  }

  static getErrorMessage(error) {
    if (typeof error === 'string') return error;
    
    if (error.code) {
      const errorMap = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-not-found': 'User not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already registered',
        'permission-denied': 'You do not have permission',
      };
      return errorMap[error.code] || error.message || 'An error occurred';
    }

    return error.message || 'An unexpected error occurred';
  }

  static createContainer() {
    const container = document.createElement('div');
    container.className = 'notification-container';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 1000; max-width: 400px;';
    document.body.appendChild(container);
    return container;
  }

  static logError(context, error) {
    console.error(`[${context}]`, error);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}
