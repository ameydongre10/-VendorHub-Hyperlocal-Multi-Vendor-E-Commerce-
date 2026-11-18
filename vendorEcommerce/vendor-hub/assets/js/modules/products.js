import { db } from "../config/firebase-config.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Optional ImageKit configuration
const IMAGEKIT_PRIVATE_KEY = "private_uS6EHyY9gfAjbQRPgSNUZH8TvFg=";
const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

/**
 * Reads a File object into a Base64 data URL.
 */
const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Adds a product by uploading image or falling back to Base64, then saving to Firestore.
 */
export const addProduct = async (productData, imageFile) => {
    try {
        let imageUrl = productData.image || "";
        let imageId = "";

        if (imageFile) {
            try {
                // Attempt ImageKit upload
                const formData = new FormData();
                formData.append("file", imageFile);
                formData.append("fileName", `prod_${Date.now()}_${(productData.name || 'item').replace(/\s+/g, '_')}`);
                formData.append("useUniqueFileName", "true");
                formData.append("folder", "/products");

                const uploadResponse = await fetch(IMAGEKIT_UPLOAD_URL, {
                    method: "POST",
                    headers: {
                        Authorization: "Basic " + btoa(IMAGEKIT_PRIVATE_KEY + ":")
                    },
                    body: formData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    if (uploadResult && uploadResult.url) {
                        imageUrl = uploadResult.url;
                        imageId = uploadResult.fileId || "";
                    }
                }
            } catch (imgKitErr) {
                console.warn("[VendorHub] ImageKit upload unavailable; falling back to Data URL:", imgKitErr.message);
            }

            // Fallback: If ImageKit did not produce a URL, use local Data URL
            if (!imageUrl) {
                imageUrl = await readFileAsDataUrl(imageFile);
            }
        }

        // Fallback placeholder if no image provided
        if (!imageUrl) {
            imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
        }

        // Clean & cast numeric values
        const priceNum = typeof productData.price === 'number' ? productData.price : parseFloat(productData.price) || 0;
        const stockNum = typeof productData.stock === 'number' ? productData.stock : parseInt(productData.stock, 10) || 0;

        const docRef = await addDoc(collection(db, "products"), {
            ...productData,
            price: priceNum,
            stock: stockNum,
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
 * Retrieves a single product by ID.
 */
export const getProductById = async (productId) => {
    try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
};

/**
 * Retrieves products belonging to a specific vendor.
 */
export const getVendorProducts = async (vendorId) => {
    try {
        const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
        const snapshot = await getDocs(q);
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return prods.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        return [];
    }
};

/**
 * Retrieves all products for the marketplace shop view.
 */
export const getAllProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return prods.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
        const stockVal = Math.max(0, parseInt(newStock, 10) || 0);
        await updateDoc(productRef, { 
            stock: stockVal,
            updatedAt: new Date().toISOString()
        });
        return { success: true, stock: stockVal };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Updates an entire product's metadata.
 */
export const updateProduct = async (productId, updatedData) => {
    try {
        const productRef = doc(db, "products", productId);
        await updateDoc(productRef, {
            ...updatedData,
            updatedAt: new Date().toISOString()
        });
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
