import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==============================
// IMAGEKIT CONFIG
// ==============================
const IMAGEKIT_PRIVATE_KEY = "private_uS6EHyY9gfAjbQRPgSNUZH8TvFg=";
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

/**
 * Adds a product by uploading the image to ImageKit and saving metadata to Firestore.
 */
export const addProduct = async (productData, imageFile) => {
    try {
        let imageUrl = "";
        let imageId = "";

        if (imageFile) {
            // A. Prepare ImageKit Upload
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("fileName", `prod_${Date.now()}_${productData.name.replace(/\s+/g, '_')}`);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", "/products");

            // B. Execute ImageKit Upload
            const uploadResponse = await fetch(IMAGEKIT_UPLOAD_URL, {
                method: "POST",
                headers: {
                    Authorization: "Basic " + btoa(IMAGEKIT_PRIVATE_KEY + ":")
                },
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.url) {
                throw new Error(uploadResult.message || "ImageKit upload failed");
            }

            imageUrl = uploadResult.url;
            imageId = uploadResult.fileId; // Storing this allows for future deletion/cleanup
        }

        // C. Save Product Metadata to Firestore
        const docRef = await addDoc(collection(db, "products"), {
            ...productData,
            image: imageUrl,
            imageKitId: imageId,
            createdAt: new Date().toISOString()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Retrieves products belonging to a specific vendor.
 */
export const getVendorProducts = async (vendorId) => {
    try {
        const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        return [];
    }
};

/**
 * Retrieves all products for the buyer shop view.
 */
export const getAllProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
};

/**
 * Updates stock levels for inventory management.
 */
export const updateProductStock = async (productId, newStock) => {
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, { stock: newStock });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Deletes a product from the database.
 */
export const deleteProduct = async (productId) => {
    try {
        await deleteDoc(doc(db, "products", productId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};