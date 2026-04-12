import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc,
    doc,
    getDoc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const createOrder = async (buyerId, items, total, vendorIds) => {
    try {
        // 1. Create the Order document
        const orderData = {
            buyerId,
            items, 
            totalAmount: total,
            vendorIds: vendorIds,
            status: "Placed",
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, "orders"), orderData);

        // 2. Reduce Stock for each item
        for (const productId of items) {
            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
                const currentStock = productSnap.data().stock || 0;
                // Ensure we don't go below zero
                const newStock = Math.max(0, currentStock - 1); 
                
                await updateDoc(productRef, { stock: newStock });
            }
        }

        return { success: true, orderId: docRef.id };
    } catch (error) {
        console.error("Order error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Updates the status of an order (e.g., Placed -> Shipped)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Fetches all orders involving a specific vendor
 */
export const getVendorOrders = async (vendorId) => {
    const q = query(collection(db, "orders"), where("vendorIds", "array-contains", vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};