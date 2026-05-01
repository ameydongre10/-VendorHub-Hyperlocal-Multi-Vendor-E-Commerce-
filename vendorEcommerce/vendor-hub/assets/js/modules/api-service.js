/**
 * api-service.js
 * Centralized service layer for all Firestore operations.
 * Wraps each call with consistent error handling and loading feedback.
 */

import { db } from "../config/firebase-config.js";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { handleError } from "./error-handler.js";

// ── Generic Helpers ────────────────────────────────────────────────────────

/**
 * Wraps an async Firestore operation with unified error handling.
 * @param {Function} operation - Async function to execute
 * @param {string}   context   - Label used in error logs
 * @returns {Promise<{success:boolean, data?:*, error?:string}>}
 */
const safeCall = async (operation, context) => {
    try {
        const data = await operation();
        return { success: true, data };
    } catch (error) {
        const message = handleError(error, context);
        return { success: false, error: message };
    }
};

// ── User / Auth Operations ────────────────────────────────────────────────

/**
 * Fetches a user document by UID.
 * @param {string} uid
 */
export const getUser = (uid) =>
    safeCall(async () => {
        const snap = await getDoc(doc(db, 'users', uid));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }, 'getUser');

/**
 * Creates a new user document in Firestore.
 * @param {string} uid
 * @param {object} userData
 */
export const createUserDoc = (uid, userData) =>
    safeCall(() => setDoc(doc(db, 'users', uid), {
        uid,
        ...userData,
        createdAt: new Date().toISOString(),
    }), 'createUserDoc');

/**
 * Updates a user document.
 * @param {string} uid
 * @param {object} updates
 */
export const updateUser = (uid, updates) =>
    safeCall(() => updateDoc(doc(db, 'users', uid), updates), 'updateUser');

// ── Product Operations ────────────────────────────────────────────────────

/**
 * Fetches all active products (for the buyer shop).
 * @returns {Promise<{success:boolean, data?:Array}>}
 */
export const fetchAllProducts = (options = {}) =>
    safeCall(async () => {
        const constraints = [];
        if (options.category) constraints.push(where('category', '==', options.category));
        if (options.limit)    constraints.push(limit(options.limit));

        const q = constraints.length
            ? query(collection(db, 'products'), ...constraints)
            : collection(db, 'products');

        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchAllProducts');

/**
 * Fetches products belonging to a specific vendor.
 * @param {string} vendorId
 */
export const fetchVendorProducts = (vendorId) =>
    safeCall(async () => {
        const q = query(collection(db, 'products'), where('vendorId', '==', vendorId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchVendorProducts');

/**
 * Fetches a single product by ID.
 * @param {string} productId
 */
export const fetchProduct = (productId) =>
    safeCall(async () => {
        const snap = await getDoc(doc(db, 'products', productId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }, 'fetchProduct');

/**
 * Adds a product to Firestore (image upload handled separately in products.js).
 * @param {object} productData
 */
export const addProductDoc = (productData) =>
    safeCall(async () => {
        const ref = await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: new Date().toISOString(),
        });
        return { id: ref.id };
    }, 'addProductDoc');

/**
 * Updates a product document.
 * @param {string} productId
 * @param {object} updates
 */
export const updateProduct = (productId, updates) =>
    safeCall(() => updateDoc(doc(db, 'products', productId), updates), 'updateProduct');

/**
 * Deletes a product document.
 * @param {string} productId
 */
export const removeProduct = (productId) =>
    safeCall(() => deleteDoc(doc(db, 'products', productId)), 'removeProduct');

// ── Order Operations ──────────────────────────────────────────────────────

/**
 * Places a new order and decrements stock for each item.
 * @param {string}   buyerId
 * @param {string[]} productIds
 * @param {number}   total
 * @param {string[]} vendorIds
 */
export const placeOrder = (buyerId, productIds, total, vendorIds) =>
    safeCall(async () => {
        const ref = await addDoc(collection(db, 'orders'), {
            buyerId,
            items: productIds,
            totalAmount: total,
            vendorIds,
            status: 'Placed',
            createdAt: new Date().toISOString(),
        });

        // Decrement stock in parallel
        await Promise.all(productIds.map(async (pid) => {
            const pRef = doc(db, 'products', pid);
            const pSnap = await getDoc(pRef);
            if (pSnap.exists()) {
                const current = pSnap.data().stock || 0;
                await updateDoc(pRef, { stock: Math.max(0, current - 1) });
            }
        }));

        return { orderId: ref.id };
    }, 'placeOrder');

/**
 * Fetches all orders for a buyer.
 * @param {string} buyerId
 */
export const fetchBuyerOrders = (buyerId) =>
    safeCall(async () => {
        const q = query(
            collection(db, 'orders'),
            where('buyerId', '==', buyerId),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchBuyerOrders');

/**
 * Fetches all orders involving a vendor.
 * @param {string} vendorId
 */
export const fetchVendorOrders = (vendorId) =>
    safeCall(async () => {
        const q = query(
            collection(db, 'orders'),
            where('vendorIds', 'array-contains', vendorId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchVendorOrders');

/**
 * Fetches all orders on the platform (admin view).
 */
export const fetchAllOrders = () =>
    safeCall(async () => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchAllOrders');

/**
 * Updates the status of an order.
 * @param {string} orderId
 * @param {string} status
 */
export const setOrderStatus = (orderId, status) =>
    safeCall(() => updateDoc(doc(db, 'orders', orderId), { status }), 'setOrderStatus');

/**
 * Subscribes to real-time order updates.
 * @param {string}   orderId
 * @param {Function} callback - (orderData) => void
 * @returns {Function} unsubscribe
 */
export const subscribeOrder = (orderId, callback) => {
    return onSnapshot(doc(db, 'orders', orderId), (snap) => {
        if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    }, (error) => handleError(error, 'subscribeOrder'));
};

// ── Vendor / Admin Operations ─────────────────────────────────────────────

/**
 * Fetches all vendors with a given status.
 * @param {'pending'|'approved'|'rejected'} status
 */
export const fetchVendorsByStatus = (status) =>
    safeCall(async () => {
        const q = query(
            collection(db, 'users'),
            where('role', '==', 'seller'),
            where('status', '==', status)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'fetchVendorsByStatus');

/**
 * Updates a vendor's approval status.
 * @param {string} vendorId
 * @param {'approved'|'rejected'} status
 */
export const setVendorStatus = (vendorId, status) =>
    safeCall(() => updateDoc(doc(db, 'users', vendorId), { status }), 'setVendorStatus');

/**
 * Fetches platform analytics (totals).
 */
export const getPlatformStats = () =>
    safeCall(async () => {
        const snap = await getDocs(collection(db, 'orders'));
        let totalSales = 0;
        snap.forEach(d => { totalSales += (d.data().totalAmount || 0); });
        return { totalSales, totalOrders: snap.size };
    }, 'getPlatformStats');

/**
 * Fetches vendor-specific stats (earnings and order count).
 * @param {string} vendorId
 */
export const getVendorStats = (vendorId) =>
    safeCall(async () => {
        const q = query(collection(db, 'orders'), where('vendorIds', 'array-contains', vendorId));
        const snap = await getDocs(q);
        let totalEarnings = 0;
        snap.forEach(d => { totalEarnings += (d.data().totalAmount || 0); });
        return {
            totalEarnings,
            orderCount: snap.size,
            commissionDeducted: totalEarnings * 0.10,
            netEarnings: totalEarnings * 0.90,
        };
    }, 'getVendorStats');

/**
 * Fetches products that are low on stock for a vendor.
 * @param {string} vendorId
 * @param {number} threshold
 */
export const getLowStockItems = (vendorId, threshold = 5) =>
    safeCall(async () => {
        const q = query(
            collection(db, 'products'),
            where('vendorId', '==', vendorId),
            where('stock', '<=', threshold)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }, 'getLowStockItems');
