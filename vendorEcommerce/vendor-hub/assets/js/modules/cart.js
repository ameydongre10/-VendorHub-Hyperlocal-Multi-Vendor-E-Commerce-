/**
 * cart.js
 *
 * Comprehensive client-side shopping cart manager for VendorHub.
 * Stores structured cart items in localStorage and provides real-time state synchronization.
 */

const CART_STORAGE_KEY = 'cart';

/**
 * Normalizes cart items from localStorage (supporting legacy array of string IDs).
 */
export const getCart = () => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // Migrate legacy string array e.g. ["id1", "id2"]
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
            const counts = {};
            parsed.forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
            const migrated = Object.entries(counts).map(([id, qty]) => ({
                id,
                quantity: qty
            }));
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(migrated));
            return migrated;
        }

        return parsed;
    } catch (e) {
        console.error("Failed to read cart from localStorage:", e);
        return [];
    }
};

/**
 * Saves current cart to localStorage and notifies listeners.
 */
const saveCart = (items) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        // Broadcast update event so badge counters in navbar refresh instantly
        window.dispatchEvent(new CustomEvent('vendorhub:cartUpdated', { detail: { items } }));
    } catch (e) {
        console.error("Failed to save cart:", e);
    }
};

/**
 * Adds a product to cart or increments existing quantity.
 */
export const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return { success: false, error: "Invalid product" };
    
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const stock = typeof product.stock === 'number' ? product.stock : parseInt(product.stock, 10) || 999;
    const addQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (existingIndex > -1) {
        const currentQty = cart[existingIndex].quantity || 1;
        const newQty = currentQty + addQty;
        if (newQty > stock) {
            return { 
                success: false, 
                error: `Cannot add more. Maximum available stock is ${stock}.`,
                currentQuantity: currentQty
            };
        }
        cart[existingIndex].quantity = newQty;
        // Update product snapshot properties
        cart[existingIndex].price = price;
        cart[existingIndex].name = product.name || cart[existingIndex].name;
        cart[existingIndex].image = product.image || cart[existingIndex].image;
    } else {
        if (addQty > stock) {
            return { 
                success: false, 
                error: `Requested quantity exceeds available stock (${stock}).` 
            };
        }
        cart.push({
            id: product.id,
            name: product.name || "Product",
            price: price,
            image: product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60",
            category: product.category || "General",
            vendorId: product.vendorId || "",
            vendorName: product.vendorName || "Local Vendor",
            stock: stock,
            quantity: addQty
        });
    }

    saveCart(cart);
    return { success: true, count: getCartCount() };
};

/**
 * Removes an item from the cart completely.
 */
export const removeFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return { success: true, count: getCartCount() };
};

/**
 * Updates the quantity of a specific item in the cart.
 */
export const updateCartQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
        return removeFromCart(productId);
    }

    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
        const maxStock = typeof item.stock === 'number' ? item.stock : 999;
        if (qty > maxStock) {
            return { success: false, error: `Only ${maxStock} units available in stock.` };
        }
        item.quantity = qty;
        saveCart(cart);
        return { success: true };
    }
    return { success: false, error: "Item not found in cart" };
};

/**
 * Returns the total number of individual items in the cart.
 */
export const getCartCount = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
};

/**
 * Calculates total monetary cost of all items in cart.
 */
export const getCartTotal = () => {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
        const qty = item.quantity || 1;
        return total + (price * qty);
    }, 0);
};

/**
 * Empties the cart.
 */
export const clearCart = () => {
    saveCart([]);
    return { success: true };
};
