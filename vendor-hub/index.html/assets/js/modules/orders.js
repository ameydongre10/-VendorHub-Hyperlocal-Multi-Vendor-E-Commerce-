import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Creates an order, records items and totals, and decrements product inventory.
 * @param {string} buyerId
 * @param {Array} items - Can be array of product IDs or array of item objects
 * @param {number} total
 * @param {Array<string>} vendorIds
 * @param {Object} [buyerInfo] - Optional buyer name/address details
 */
export const createOrder = async (buyerId, items, total, vendorIds, buyerInfo = {}) => {
    try {
        // Normalize items array with snapshot details if possible
        const normalizedItems = [];
        const uniqueVendorIds = new Set(vendorIds || []);

        for (const item of items) {
            const productId = typeof item === 'object' ? (item.id || item.productId) : item;
            const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;

            let itemSnapshot = typeof item === 'object' ? { ...item } : { id: productId, quantity: 1 };

            // Fetch live product to verify and decrement stock
            try {
                const productRef = doc(db, "products", productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const prodData = productSnap.data();
                    if (prodData.vendorId) {
                        uniqueVendorIds.add(prodData.vendorId);
                    }

                    // Attach snapshot info if not present
                    if (!itemSnapshot.name) itemSnapshot.name = prodData.name || "Product";
                    if (!itemSnapshot.price) itemSnapshot.price = prodData.price || 0;
                    if (!itemSnapshot.image) itemSnapshot.image = prodData.image || "";
                    if (!itemSnapshot.vendorId) itemSnapshot.vendorId = prodData.vendorId || "";

                    const currentStock = typeof prodData.stock === 'number' ? prodData.stock : parseInt(prodData.stock) || 0;
                    const newStock = Math.max(0, currentStock - quantity);
                    await updateDoc(productRef, { stock: newStock });
                }
            } catch (stockErr) {
                console.warn(`Could not update stock for product ${productId}:`, stockErr);
            }

            normalizedItems.push(itemSnapshot);
        }

        // Create the Order document
        const orderData = {
            buyerId,
            buyerName: buyerInfo.name || "Customer",
            buyerEmail: buyerInfo.email || "",
            shippingAddress: buyerInfo.address || "Local Pickup / Hyperlocal Delivery",
            items: normalizedItems, 
            totalAmount: typeof total === 'number' ? total : parseFloat(total) || 0,
            vendorIds: Array.from(uniqueVendorIds),
            status: "Placed",
            createdAt: new Date().toISOString(),
            statusHistory: [
                { status: "Placed", timestamp: new Date().toISOString(), note: "Order placed by buyer" }
            ]
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        return { success: true, orderId: docRef.id };
    } catch (error) {
        console.error("Order creation error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Updates the status of an order (e.g., Placed -> Shipped -> Delivered -> Cancelled)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        
        let history = [];
        if (orderSnap.exists()) {
            history = orderSnap.data().statusHistory || [];
        }

        history.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });

        await updateDoc(orderRef, { 
            status: newStatus,
            statusHistory: history,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches an order by its ID.
 */
export const getOrderById = async (orderId) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
            return { id: orderSnap.id, ...orderSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};

/**
 * Fetches all orders involving a specific vendor
 */
export const getVendorOrders = async (vendorId) => {
    try {
        const q = query(collection(db, "orders"), where("vendorIds", "array-contains", vendorId));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort descending by creation date
        return orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        return [];
    }
};

/**
 * Fetches all orders placed by a specific buyer
 */
export const getBuyerOrders = async (buyerId) => {
    try {
        const q = query(collection(db, "orders"), where("buyerId", "==", buyerId));
        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching buyer orders:", error);
        return [];
    }
};
