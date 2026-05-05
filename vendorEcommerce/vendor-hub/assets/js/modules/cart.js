/**
 * cart.js
 * Shopping cart state management using localStorage.
 * Cart item shape: { id, name, price, image, quantity, vendorId }
 */

const CART_KEY = 'vh_cart';

export function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product) {
  const cart     = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  updateCartBadge();
  return cart;
}

export function updateQuantity(productId, quantity) {
  if (quantity <= 0) return removeFromCart(productId);
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
    updateCartBadge();
  }
  return cart;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

export function isInCart(productId) {
  return getCart().some(item => item.id === productId);
}

export function updateCartBadge() {
  const badges = document.querySelectorAll('[data-cart-count]');
  const count  = getCartCount();
  badges.forEach(el => {
    el.textContent    = count;
    el.style.display  = count > 0 ? '' : 'none';
  });
}
