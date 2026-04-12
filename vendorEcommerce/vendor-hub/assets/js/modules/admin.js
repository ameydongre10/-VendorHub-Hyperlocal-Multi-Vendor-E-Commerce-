import { db } from "../config/firebase-config.js";
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// assets/js/admin-app.js
import { initParallax } from "./utils/parallax.js";
import { initTheme } from "./utils/theme-handler.js";
import { getPlatformAnalytics, getPendingVendors } from "./modules/admin.js";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Beautification
    initTheme();
    initParallax();

    // 2. Load Dashboard Data
    try {
        const stats = await getPlatformAnalytics();
        // Update your UI elements...
    } catch (error) {
        console.error("Dashboard init failed:", error);
    }
});

export const getPendingVendors = async () => {
    const q = query(collection(db, "users"), where("role", "==", "seller"), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateVendorStatus = async (vendorId, status) => {
    const vendorRef = doc(db, "users", vendorId);
    await updateDoc(vendorRef, { status: status });
};

export const getPlatformAnalytics = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    let totalSales = 0;
    snapshot.forEach(doc => {
        totalSales += doc.data().totalAmount;
    });
    return {
        totalSales,
        totalOrders: snapshot.size
    };
};