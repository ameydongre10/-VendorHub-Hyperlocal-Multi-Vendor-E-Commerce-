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
            totalEarnings += data.totalAmount; 
            orderCount++;
        });

        return {
            totalEarnings,
            orderCount,
            commissionDeducted: totalEarnings * 0.10
        };
    } catch (error) {
        console.error("Error fetching vendor stats:", error);
        return { totalEarnings: 0, orderCount: 0, commissionDeducted: 0 };
    }
};

/**
 * Fetches products that are running low on stock for a specific vendor.
 * This is the function that was missing the export!
 */
export const getLowStockProducts = async (vendorId, threshold = 5) => {
    try {
        const q = query(
            collection(db, "products"), 
            where("vendorId", "==", vendorId), 
            where("stock", "<=", threshold)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        return [];
    }
};