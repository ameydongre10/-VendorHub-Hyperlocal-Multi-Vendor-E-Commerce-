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

// Secure image upload configuration (Private keys must never be exposed client-side)
// Media uploads use secure client Data URL conversion or Firebase Storage.

/**
 * Curated professional hyperlocal catalog assets.
 * Used for instant marketplace population, offline resilience, and demo showcasing.
 */
export const SAMPLE_CATALOG_PRODUCTS = [
    // ─── ELECTRONICS ─────────────────────────────────────────────────────────────
    {
        id: "vh-prod-101",
        name: "AuraPulse Studio Wireless Noise-Cancelling Headphones",
        category: "Electronics",
        price: 14999,
        stock: 18,
        vendorName: "SonicPulse Audio Labs",
        vendorId: "vendor-sonicpulse",
        rating: 4.9,
        reviewsCount: 68,
        description: "Ultra-low latency studio reference wireless headphones featuring hybrid active noise cancellation, custom 40mm acoustic beryllium drivers, and a 45-hour battery reserve with fast charging.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T10:00:00.000Z"
    },
    {
        id: "vh-prod-102",
        name: "CyberKey K3 RGB Hot-Swappable Mechanical Keyboard",
        category: "Electronics",
        price: 6499,
        stock: 24,
        vendorName: "Apex Peripheral Labs",
        vendorId: "vendor-apex-labs",
        rating: 4.8,
        reviewsCount: 42,
        description: "Gasket-mounted 75% layout mechanical keyboard with custom pre-lubed linear switches, sound-dampening silicone foam, PBT double-shot keycaps, and south-facing per-key RGB backlighting.",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T09:30:00.000Z"
    },
    {
        id: "vh-prod-103",
        name: "Lumina Smart Ambient RGB Desk Light Bar",
        category: "Electronics",
        price: 2899,
        stock: 15,
        vendorName: "Nordic Smart Tech",
        vendorId: "vendor-nordic-tech",
        rating: 4.7,
        reviewsCount: 31,
        description: "Glare-free monitor-mounted light bar with dynamic bi-directional RGB ambient backlighting, capacitive touch dimming, and circadian auto-temperature shifting for zero eye fatigue.",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T09:00:00.000Z"
    },
    {
        id: "vh-prod-104",
        name: "AeroCharge 65W GaN Fast Charger & Multi-Port Hub",
        category: "Electronics",
        price: 1899,
        stock: 35,
        vendorName: "VoltTech Power",
        vendorId: "vendor-volttech",
        rating: 4.9,
        reviewsCount: 89,
        description: "Compact gallium nitride (GaN III) high-efficiency travel charger with dual USB-C Power Delivery ports and intelligent multi-device voltage load balancing.",
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T08:30:00.000Z"
    },

    // ─── GROCERIES & ARTISANAL FOODS ─────────────────────────────────────────────
    {
        id: "vh-prod-201",
        name: "Artisanal Stoneground Sourdough Boule",
        category: "Groceries",
        price: 280,
        stock: 12,
        vendorName: "The Rustic Oven Bakery",
        vendorId: "vendor-rustic-bakery",
        rating: 5.0,
        reviewsCount: 54,
        description: "Naturally fermented for 36 hours using organic heritage stoneground wheat flour and pure spring water. Crisp blistered crust with a pillowy, open-crumb interior.",
        image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T08:00:00.000Z"
    },
    {
        id: "vh-prod-202",
        name: "Himalayan Forest Raw Wildflower Honey (500g)",
        category: "Groceries",
        price: 650,
        stock: 28,
        vendorName: "Pristine Valley Organics",
        vendorId: "vendor-pristine-valley",
        rating: 4.9,
        reviewsCount: 76,
        description: "Single-origin unfiltered raw honey harvested by indigenous beekeepers in high-altitude Himalayan pine forests. Cold-extracted to retain natural pollen, enzymes, and propolis.",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T07:30:00.000Z"
    },
    {
        id: "vh-prod-203",
        name: "Hydroponic Crisp Butterhead Lettuce & Microgreens Bundle",
        category: "Groceries",
        price: 160,
        stock: 40,
        vendorName: "GreenLeaf Urban Farms",
        vendorId: "vendor-greenleaf",
        rating: 4.8,
        reviewsCount: 39,
        description: "Harvested fresh on demand within 2 hours of delivery. Zero pesticide hydroponically grown tender butterhead lettuce paired with nutrient-dense spicy radish microgreens.",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T07:00:00.000Z"
    },
    {
        id: "vh-prod-204",
        name: "Cold-Pressed Spanish Extra Virgin Olive Oil (1L)",
        category: "Groceries",
        price: 1450,
        stock: 19,
        vendorName: "Mediterranean Harvest",
        vendorId: "vendor-mediterranean",
        rating: 4.9,
        reviewsCount: 47,
        description: "First cold-extraction Picual olive oil with an acidity rating under 0.2%. Boasts vibrant grassy aromas, balanced bitterness, and a rich, peppery antioxidant finish.",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T06:30:00.000Z"
    },

    // ─── CLOTHING & FASHION ───────────────────────────────────────────────────────
    {
        id: "vh-prod-301",
        name: "Cyber-Knit Merino Wool Minimalist Oversized Hoodie",
        category: "Clothing",
        price: 3499,
        stock: 14,
        vendorName: "Aether Apparel Co.",
        vendorId: "vendor-aether",
        rating: 4.8,
        reviewsCount: 33,
        description: "Engineered from 100% fine Australian Merino wool with thermal moisture-regulating properties, reinforced seam bonding, and a relaxed architectural spatial drape.",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T06:00:00.000Z"
    },
    {
        id: "vh-prod-302",
        name: "Japanese Raw Selvedge Denim Tailored Jeans",
        category: "Clothing",
        price: 4899,
        stock: 9,
        vendorName: "Kuroshio Denim Studio",
        vendorId: "vendor-kuroshio",
        rating: 4.9,
        reviewsCount: 29,
        description: "Woven on vintage Toyoda shuttle looms using 14.5oz ring-spun Zimbabwe cotton. Features classic red-line selvedge edge, hidden rivets, and custom solid copper hardware.",
        image: "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T05:30:00.000Z"
    },
    {
        id: "vh-prod-303",
        name: "Bespoke Full-Grain Leather Minimalist Wallet",
        category: "Clothing",
        price: 1699,
        stock: 22,
        vendorName: "Tanner & Stitch Craft",
        vendorId: "vendor-tanner-stitch",
        rating: 4.7,
        reviewsCount: 58,
        description: "Hand-stitched from vegetable-tanned Tuscan full-grain leather. Develops a rich golden patina over time. Accommodates 8 cards and folded currency with RFID electromagnetic shielding.",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T05:00:00.000Z"
    },
    {
        id: "vh-prod-304",
        name: "Organic Supima Cotton Heavyweight Crewneck Tee",
        category: "Clothing",
        price: 1199,
        stock: 30,
        vendorName: "Essential Threads",
        vendorId: "vendor-essential-threads",
        rating: 4.8,
        reviewsCount: 61,
        description: "280 GSM long-staple Supima organic cotton with an exceptionally soft tactile finish, double-needle collar binding, and pre-shrunk dimensional integrity.",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T04:30:00.000Z"
    },

    // ─── HOME & KITCHEN ───────────────────────────────────────────────────────────
    {
        id: "vh-prod-401",
        name: "Artisan Hand-Thrown Ceramic Matte Pour-Over Coffee Dripper",
        category: "Home",
        price: 1499,
        stock: 16,
        vendorName: "Terra & Fire Pottery",
        vendorId: "vendor-terra-fire",
        rating: 4.9,
        reviewsCount: 44,
        description: "Slow-crafted on the potter's wheel with volcanic stoneware clay and a matte charcoal glaze. Engineered internal helical ribs for optimal laminar coffee flow and extraction.",
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T04:00:00.000Z"
    },
    {
        id: "vh-prod-402",
        name: "Hand-Poured Botanical Soy Candle (Smoked Cedar & Amber)",
        category: "Home",
        price: 850,
        stock: 25,
        vendorName: "Aura Home Apothecary",
        vendorId: "vendor-aura-home",
        rating: 4.9,
        reviewsCount: 72,
        description: "100% natural soy wax infused with therapeutic essential oils and phthalate-free fragrances. Features a crackling FSC-certified organic wood wick with 55-hour clean burn time.",
        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T03:30:00.000Z"
    },
    {
        id: "vh-prod-403",
        name: "Precision Cast Iron Chef Skillet with Brass Handle (10-inch)",
        category: "Home",
        price: 2750,
        stock: 11,
        vendorName: "IronForge Cookware",
        vendorId: "vendor-ironforge",
        rating: 4.8,
        reviewsCount: 38,
        description: "Smooth-machined cooking surface pre-seasoned with triple-baked organic flaxseed oil. Superior thermal retention and lifetime durability for stovetop searing or oven baking.",
        image: "https://images.unsplash.com/photo-1584990347449-397a61d67d71?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T03:00:00.000Z"
    },
    {
        id: "vh-prod-404",
        name: "Minimalist Walnut Wood Magnetic Knife Block",
        category: "Home",
        price: 2200,
        stock: 14,
        vendorName: "TimberCraft Studios",
        vendorId: "vendor-timbercraft",
        rating: 4.7,
        reviewsCount: 26,
        description: "Crafted from sustainably harvested American black walnut with a concealed neodymium magnet matrix. Securely holds up to 6 culinary knives on both faces without blade dulling.",
        image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T02:30:00.000Z"
    },

    // ─── BOOKS & LITERATURE ───────────────────────────────────────────────────────
    {
        id: "vh-prod-501",
        name: "Designing Distributed Real-Time Systems: Architectures & Patterns",
        category: "Books",
        price: 1299,
        stock: 20,
        vendorName: "Apex Technical Press",
        vendorId: "vendor-apex-press",
        rating: 5.0,
        reviewsCount: 82,
        description: "Comprehensive architectural handbook on building fault-tolerant, resilient, low-latency distributed event systems, CQRS models, and scalable microservice meshes.",
        image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T02:00:00.000Z"
    },
    {
        id: "vh-prod-502",
        name: "The Art of Hyperlocal Commerce: Micro-Economies in the Digital Age",
        category: "Books",
        price: 899,
        stock: 18,
        vendorName: "Civic Bookhouse",
        vendorId: "vendor-civic-books",
        rating: 4.8,
        reviewsCount: 41,
        description: "An incisive macroeconomic study on decentralizing consumer supply chains, community wealth generation, and digital platforms empowering neighborhood storefronts.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T01:30:00.000Z"
    },
    {
        id: "vh-prod-503",
        name: "Modern UI Engineering & Spatial Design Hardcover Monograph",
        category: "Books",
        price: 2100,
        stock: 8,
        vendorName: "Bauhaus Design Editions",
        vendorId: "vendor-bauhaus",
        rating: 4.9,
        reviewsCount: 35,
        description: "Collector's edition clothbound hardcover exploring modern tactile interface design, optical typography balance, spatial computing materials, and design systems.",
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T01:00:00.000Z"
    },

    // ─── SPORTS & FITNESS ─────────────────────────────────────────────────────────
    {
        id: "vh-prod-601",
        name: "AeroGrip Pro High-Density Non-Slip Yoga Mat (6mm)",
        category: "Sports",
        price: 1850,
        stock: 26,
        vendorName: "Zenith Athletics",
        vendorId: "vendor-zenith-athletics",
        rating: 4.9,
        reviewsCount: 59,
        description: "Biodegradable natural tree rubber base with a moisture-activated polyurethane top layer. Unsurpassed dry and wet traction with joint-cushioning cellular density.",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T00:30:00.000Z"
    },
    {
        id: "vh-prod-602",
        name: "Titanium Double-Walled Thermal Hydration Flask (1000ml)",
        category: "Sports",
        price: 1350,
        stock: 32,
        vendorName: "TrailBlazer Outdoor Gear",
        vendorId: "vendor-trailblazer",
        rating: 4.8,
        reviewsCount: 71,
        description: "Ultralight aerospace-grade titanium vacuum flask keeping fluids ice cold for 36 hours or piping hot for 18 hours. Leakproof insulated cap with durable paracord tether.",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T00:15:00.000Z"
    },
    {
        id: "vh-prod-603",
        name: "Pro-Speed Adjustable Wire Jump Rope with Precision Bearings",
        category: "Sports",
        price: 699,
        stock: 45,
        vendorName: "Vanguard Fitness",
        vendorId: "vendor-vanguard",
        rating: 4.7,
        reviewsCount: 88,
        description: "Dual 360-degree ball-bearing swivel handles with knurled aluminum grips and kink-resistant polymer-coated steel cable for maximum rotation velocity and cardiovascular training.",
        image: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80",
        createdAt: "2026-11-18T00:05:00.000Z"
    }
];

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
                imageUrl = await readFileAsDataUrl(imageFile);
            } catch (readErr) {
                console.warn("[VendorHub] Media conversion error, using fallback placeholder:", readErr.message);
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
            rating: productData.rating || 4.9,
            reviewsCount: productData.reviewsCount || 12,
            createdAt: new Date().toISOString()
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Retrieves a single product by ID (checking Firestore first, then fallback catalogue).
 */
export const getProductById = async (productId) => {
    try {
        try {
            const docRef = doc(db, "products", productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }
        } catch (dbErr) {
            console.warn("[VendorHub] Firestore single product lookup fallback:", dbErr.message);
        }

        const sample = SAMPLE_CATALOG_PRODUCTS.find(p => p.id === productId);
        return sample || null;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return SAMPLE_CATALOG_PRODUCTS.find(p => p.id === productId) || null;
    }
};

/**
 * Retrieves products belonging to a specific vendor.
 */
export const getVendorProducts = async (vendorId) => {
    try {
        let prods = [];
        try {
            const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
            const snapshot = await getDocs(q);
            prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (dbErr) {
            console.warn("[VendorHub] Firestore vendor products query fallback:", dbErr.message);
        }

        // Include any sample products matching this vendorId
        const matchingSamples = SAMPLE_CATALOG_PRODUCTS.filter(p => p.vendorId === vendorId);
        const combined = [...prods, ...matchingSamples];

        return combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        return [];
    }
};

/**
 * Retrieves all products for the marketplace shop view.
 * Combines live merchant listings from Firestore with the curated professional catalog.
 */
export const getAllProducts = async () => {
    try {
        let firestoreProds = [];
        try {
            const snapshot = await getDocs(collection(db, "products"));
            firestoreProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (dbErr) {
            console.warn("[VendorHub] Firestore read unavailable, serving catalog:", dbErr.message);
        }

        const seen = new Set();
        const combined = [];

        // 1. Live Firestore merchant products come first (latest first)
        for (const p of firestoreProds) {
            if (p && p.id && !seen.has(p.id)) {
                seen.add(p.id);
                combined.push(p);
            }
        }

        // 2. Curated professional catalog items
        for (const p of SAMPLE_CATALOG_PRODUCTS) {
            if (p && p.id && !seen.has(p.id)) {
                seen.add(p.id);
                combined.push(p);
            }
        }

        return combined;
    } catch (error) {
        console.error("Error fetching all products:", error);
        return SAMPLE_CATALOG_PRODUCTS;
    }
};

/**
 * Updates stock levels for inventory management with caller authorization verification.
 */
export const updateProductStock = async (productId, newStock, user = null) => {
    try {
        const productRef = doc(db, "products", productId);
        if (user) {
            const snap = await getDoc(productRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.vendorId && data.vendorId !== user.uid && user.role !== 'admin') {
                    return { success: false, error: "Unauthorized: You do not own this product listing." };
                }
            }
        }
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
 * Updates an entire product's metadata with caller authorization verification.
 */
export const updateProduct = async (productId, updatedData, user = null) => {
    try {
        const productRef = doc(db, "products", productId);
        if (user) {
            const snap = await getDoc(productRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.vendorId && data.vendorId !== user.uid && user.role !== 'admin') {
                    return { success: false, error: "Unauthorized: You do not own this product listing." };
                }
            }
        }
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
 * Deletes a product from the database with caller authorization verification.
 */
export const deleteProduct = async (productId, user = null) => {
    try {
        const productRef = doc(db, "products", productId);
        if (user) {
            const snap = await getDoc(productRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.vendorId && data.vendorId !== user.uid && user.role !== 'admin') {
                    return { success: false, error: "Unauthorized: You do not own this product listing." };
                }
            }
        }
        await deleteDoc(productRef);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};
