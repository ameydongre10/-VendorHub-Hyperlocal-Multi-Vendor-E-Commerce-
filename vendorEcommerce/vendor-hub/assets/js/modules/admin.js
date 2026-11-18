import { db } from "../config/firebase-config.js";
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Fetches all vendors whose status is "pending".
 */
export const getPendingVendors = async () => {
    try {
        const q = query(
            collection(db, "users"), 
            where("role", "==", "seller"), 
            where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching pending vendors:", error);
        return [];
    }
};

/**
 * Fetches all vendors on the platform regardless of status.
 */
export const getAllVendors = async () => {
    try {
        const q = query(
            collection(db, "users"), 
            where("role", "==", "seller")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all vendors:", error);
        return [];
    }
};

/**
 * Updates a vendor's approval status (approved / rejected / pending).
 */
export const updateVendorStatus = async (vendorId, status) => {
    try {
        const vendorRef = doc(db, "users", vendorId);
        await updateDoc(vendorRef, { 
            status: status,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating vendor status:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Fetches overall platform analytics (sales, order counts, revenue).
 */
export const getPlatformAnalytics = async () => {
    try {
        const snapshot = await getDocs(collection(db, "orders"));
        let totalSales = 0;
        let totalOrders = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            const amount = typeof data.totalAmount === "number" ? data.totalAmount : parseFloat(data.totalAmount) || 0;
            totalSales += amount;
            totalOrders++;
        });

        // Also count vendors and products
        let vendorCount = 0;
        let buyerCount = 0;
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            usersSnap.forEach(d => {
                const u = d.data();
                if (u.role === 'seller') vendorCount++;
                if (u.role === 'buyer') buyerCount++;
            });
        } catch (e) {
            console.warn("Could not aggregate user stats:", e);
        }

        return {
            totalSales,
            totalOrders,
            platformRevenue: totalSales * 0.10, // 10% platform take-rate
            vendorCount,
            buyerCount
        };
    } catch (error) {
        console.error("Error getting platform analytics:", error);
        return {
            totalSales: 0,
            totalOrders: 0,
            platformRevenue: 0,
            vendorCount: 0,
            buyerCount: 0
        };
    }
};
