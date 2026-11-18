import { db } from "../config/firebase-config.js";
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    query, 
    where, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Normalize email for case-insensitive matching
const normalizeEmail = (email) => (email || '').trim().toLowerCase();

// Pre-configured default demo accounts for instant access
export const DEMO_ACCOUNTS = [
    {
        uid: "usr-admin-default",
        email: "admin@vendorhub.com",
        password: "admin123",
        name: "Platform Administrator",
        role: "admin",
        status: "approved"
    },
    {
        uid: "usr-seller-default",
        email: "seller@vendorhub.com",
        password: "seller123",
        name: "Artisan Merchant Studio",
        role: "seller",
        status: "approved"
    },
    {
        uid: "usr-buyer-default",
        email: "buyer@vendorhub.com",
        password: "buyer123",
        name: "Devon Consumer",
        role: "buyer",
        status: "approved"
    }
];

/**
 * Retrieves the local registered users cache.
 */
const getLocalUsers = () => {
    try {
        const raw = localStorage.getItem("vh_registered_users");
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
};

/**
 * Persists a user to local storage registry.
 */
const saveLocalUser = (userObj) => {
    try {
        const users = getLocalUsers();
        const normEmail = normalizeEmail(userObj.email);
        const filtered = users.filter(u => normalizeEmail(u.email) !== normEmail);
        filtered.push({
            ...userObj,
            email: normEmail
        });
        localStorage.setItem("vh_registered_users", JSON.stringify(filtered));
    } catch (e) {
        console.warn("[VendorHub Auth] Could not update local user registry:", e.message);
    }
};

/**
 * Registers a new user. Saves to both local persistent store and Firestore.
 */
export const registerUser = async (email, password, userData) => {
    try {
        const normEmail = normalizeEmail(email);
        const trimmedPassword = (password || '').trim();

        if (!normEmail || !trimmedPassword) {
            return { success: false, error: "Email and password are required." };
        }

        // 1. Check local registered cache & demo accounts
        const localUsers = getLocalUsers();
        const existsLocally = localUsers.some(u => normalizeEmail(u.email) === normEmail) ||
                              DEMO_ACCOUNTS.some(u => normalizeEmail(u.email) === normEmail);

        if (existsLocally) {
            return { success: false, error: "An account with this email already exists. Please log in." };
        }

        // 2. Check Firestore if reachable
        try {
            const q = query(collection(db, "users"), where("email", "==", normEmail));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { success: false, error: "An account with this email already exists in network records." };
            }
        } catch (dbCheckErr) {
            console.warn("[VendorHub Auth] Firestore check bypassed, using local store:", dbCheckErr.message);
        }

        const userId = "usr_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        // Sellers are approved by default so users can immediately access their store
        const status = "approved";

        const newUser = {
            uid: userId,
            email: normEmail,
            password: trimmedPassword, 
            role: userData.role || "buyer",
            name: (userData.name || "User").trim(),
            status: status,
            createdAt: new Date().toISOString()
        };

        // Save to local registry first (guarantees login works even if Firestore is offline/unindexed)
        saveLocalUser(newUser);

        // Attempt Firestore write
        try {
            await setDoc(doc(db, "users", userId), newUser);
        } catch (dbWriteErr) {
            console.warn("[VendorHub Auth] Firestore write deferred to offline cache:", dbWriteErr.message);
        }
        
        // Save active session
        const sessionData = { 
            uid: userId, 
            email: normEmail,
            name: newUser.name,
            role: newUser.role, 
            status: status 
        };
        localStorage.setItem("userSession", JSON.stringify(sessionData));

        return { success: true, ...sessionData };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Authenticates a user by email and password.
 * Checks Demo accounts, Local Registry, and Firestore with resilient fallbacks.
 */
export const loginUser = async (email, password) => {
    try {
        const normEmail = normalizeEmail(email);
        const trimmedPassword = (password || '').trim();

        if (!normEmail || !trimmedPassword) {
            return { success: false, error: "Please enter both email and password." };
        }

        // 1. Check built-in demo accounts
        const demoMatch = DEMO_ACCOUNTS.find(u => normalizeEmail(u.email) === normEmail);
        if (demoMatch) {
            if (demoMatch.password === trimmedPassword) {
                const session = {
                    uid: demoMatch.uid,
                    email: demoMatch.email,
                    name: demoMatch.name,
                    role: demoMatch.role,
                    status: demoMatch.status
                };
                localStorage.setItem("userSession", JSON.stringify(session));
                return { success: true, ...session };
            } else {
                return { success: false, error: "Incorrect password for demo account." };
            }
        }

        // 2. Check local user registry (from previous registrations on this device)
        const localUsers = getLocalUsers();
        const localMatch = localUsers.find(u => normalizeEmail(u.email) === normEmail);
        if (localMatch) {
            if (localMatch.password === trimmedPassword) {
                const session = {
                    uid: localMatch.uid,
                    email: localMatch.email,
                    name: localMatch.name || "User",
                    role: localMatch.role || "buyer",
                    status: localMatch.status || "approved"
                };
                localStorage.setItem("userSession", JSON.stringify(session));
                return { success: true, ...session };
            } else {
                return { success: false, error: "Incorrect password. Please verify your credentials." };
            }
        }

        // 3. Query Firestore using single-field query (no composite index required)
        try {
            const q = query(
                collection(db, "users"), 
                where("email", "==", normEmail)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                if (userData.password === trimmedPassword) {
                    const sessionData = { 
                        uid: userData.uid || userDoc.id, 
                        email: userData.email,
                        name: userData.name || "User",
                        role: userData.role || "buyer",
                        status: userData.status || "approved"
                    };

                    // Sync to local registry for subsequent offline logins
                    saveLocalUser(userData);
                    localStorage.setItem("userSession", JSON.stringify(sessionData));

                    return { success: true, ...sessionData };
                } else {
                    return { success: false, error: "Incorrect password. Please verify your credentials." };
                }
            }
        } catch (dbErr) {
            console.warn("[VendorHub Auth] Firestore query error, checking fallback:", dbErr.message);
        }

        return { success: false, error: "No account found with this email. Please register first." };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Logs out the current user session.
 */
export const logoutUser = () => {
    localStorage.removeItem("userSession");
    return Promise.resolve();
};

/**
 * Returns the currently authenticated user from session.
 */
export const getCurrentUser = () => {
    try {
        const session = localStorage.getItem("userSession");
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Executes a callback with the active user session.
 */
export const checkAuthState = (callback) => {
    const session = getCurrentUser();
    if (session) {
        callback(session);
    } else {
        callback(null);
    }
};
