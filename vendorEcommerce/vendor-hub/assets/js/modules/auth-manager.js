/**
 * auth-manager.js
 * Authentication state management and role-based access control.
 * Wraps the existing localStorage-based auth system.
 */

export const ROLES  = { BUYER: 'buyer', SELLER: 'seller', ADMIN: 'admin' };
export const STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' };

const LOGIN_URL = '../auth/login.html';

export function getSession() {
  try { return JSON.parse(localStorage.getItem('userSession')) || null; }
  catch { return null; }
}

export function setSession(data) {
  localStorage.setItem('userSession', JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem('userSession');
}

export function isLoggedIn() {
  return getSession() !== null;
}

export function getCurrentUser() {
  return getSession();
}

export function requireAuth(allowedRoles = null) {
  const session = getSession();
  if (!session) {
    window.location.href = LOGIN_URL;
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirectByRole(session.role);
    return null;
  }
  if (session.role === ROLES.SELLER && session.status === STATUS.PENDING) {
    import('./error-handler.js').then(({ showWarning }) => {
      showWarning('Your seller account is pending admin approval.');
    });
    window.location.href = LOGIN_URL;
    return null;
  }
  return session;
}

export function redirectByRole(role) {
  const map = {
    [ROLES.BUYER]:  '../buyer/shop.html',
    [ROLES.SELLER]: '../seller/dashboard.html',
    [ROLES.ADMIN]:  '../admin/dashboard.html',
  };
  window.location.href = map[role] || LOGIN_URL;
}

export function redirectAfterLogin(role, status) {
  if (role === ROLES.ADMIN) {
    window.location.href = '../admin/dashboard.html';
    return;
  }
  if (role === ROLES.SELLER) {
    if (status === STATUS.PENDING)  return { blocked: true, message: 'Account pending approval.' };
    if (status === STATUS.REJECTED) return { blocked: true, message: 'Account has been rejected.' };
    window.location.href = '../seller/dashboard.html';
    return;
  }
  window.location.href = '../buyer/shop.html';
}

export function logout() {
  clearSession();
  window.location.href = LOGIN_URL;
}

export function updateNavAuth() {
  const session      = getSession();
  const guestEls     = document.querySelectorAll('[data-auth="guest"]');
  const userEls      = document.querySelectorAll('[data-auth="user"]');
  const userNameEl   = document.querySelector('[data-user-name]');
  const userRoleEl   = document.querySelector('[data-user-role]');

  if (session) {
    guestEls.forEach(el => el.style.display = 'none');
    userEls.forEach(el  => el.style.display = '');
    if (userNameEl) userNameEl.textContent = session.name || 'User';
    if (userRoleEl) userRoleEl.textContent = session.role || '';
  } else {
    guestEls.forEach(el => el.style.display = '');
    userEls.forEach(el  => el.style.display = 'none');
  }
}
