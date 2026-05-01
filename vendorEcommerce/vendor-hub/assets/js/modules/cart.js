/**
 * cart.js
 * localStorage-based cart with Firestore product resolution.
 */

const CART_KEY = 'vh_cart';

/** Returns array of product IDs in cart */
export const getCartIds = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');

/** Saves cart IDs to localStorage */
const saveCart = (ids) => localStorage.setItem(CART_KEY, JSON.stringify(ids));

/** Adds a product ID to the cart (no duplicates) */
export const addToCart = (productId) => {
    const ids = getCartIds();
    if (!ids.includes(productId)) {
        ids.push(productId);
        saveCart(ids);
        return { added: true };
    }
    return { added: false, reason: 'Already in cart' };
};

/** Removes a product ID from the cart by value */
export const removeFromCart = (productId) => {
    const ids = getCartIds().filter(id => id !== productId);
    saveCart(ids);
};

/** Removes item at a specific index */
export const removeFromCartByIndex = (index) => {
    const ids = getCartIds();
    ids.splice(index, 1);
    saveCart(ids);
};

/** Clears the entire cart */
export const clearCart = () => localStorage.removeItem(CART_KEY);

/** Returns the number of items in the cart */
export const getCartCount = () => getCartIds().length;

/** Updates cart count badge(s) in the DOM if present */
export const updateCartBadge = () => {
    const count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
};
