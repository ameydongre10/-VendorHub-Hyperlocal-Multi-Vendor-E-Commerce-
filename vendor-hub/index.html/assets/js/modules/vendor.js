import { db } from "../config/firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Fetches earnings and order count for a specific vendor.
 */
export const getVendorStats = async (vendorId) => {
    try {
        const q = query(collection(db, "orders"), where("vendorIds", "array-contains", vendorId));
        const snapshot = await getDocs(q);
        
        let totalEarnings = 0;
        let orderCount = 0;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const amt = typeof data.totalAmount === 'number' ? data.totalAmount : parseFloat(data.totalAmount) || 0;
            totalEarnings += amt; 
            orderCount++;
        });

        return {
            totalEarnings,
            orderCount,
            commissionDeducted: totalEarnings * 0.10,
            netEarnings: totalEarnings * 0.90
        };
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        return { totalEarnings: 0, orderCount: 0, commissionDeducted: 0, netEarnings: 0 };
    }
};

/**
 * Fetches products that are running low on stock for a specific vendor.
 * Filters client-side to prevent Firestore composite index errors.
 */
export const getLowStockProducts = async (vendorId, threshold = 5) => {
    try {
        const q = query(
            collection(db, "products"), 
            where("vendorId", "==", vendorId)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return products.filter(p => {
            const stock = typeof p.stock === 'number' ? p.stock : parseInt(p.stock, 10);
            return !isNaN(stock) && stock <= threshold;
        });
    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        return [];
    }
};
