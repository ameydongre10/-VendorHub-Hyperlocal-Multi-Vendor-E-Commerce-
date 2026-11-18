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

export const registerUser = async (email, password, userData) => {
    try {
        const q = query(collection(db, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return { success: false, error: "User already exists" };
        }

        const userId = Date.now().toString(); 
        const status = userData.role === "seller" ? "pending" : "approved";
        const newUser = {
            uid: userId,
            email: email,
            password: password, 
            role: userData.role || "buyer",
            name: userData.name || "User",
            status: status,
            createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, "users", userId), newUser);
        
        // Save session
        const sessionData = { 
            uid: userId, 
            email: email,
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

export const loginUser = async (email, password) => {
    try {
        const q = query(
            collection(db, "users"), 
            where("email", "==", email), 
            where("password", "==", password)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { success: false, error: "Invalid email or password" };
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const sessionData = { 
            uid: userData.uid || userDoc.id, 
            email: userData.email,
            name: userData.name || "User",
            role: userData.role,
            status: userData.status || "approved"
        };

        localStorage.setItem("userSession", JSON.stringify(sessionData));

        return { 
            success: true, 
            ...sessionData
        };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
    }
};

export const logoutUser = () => {
    localStorage.removeItem("userSession");
    return Promise.resolve();
};

export const getCurrentUser = () => {
    try {
        const session = localStorage.getItem("userSession");
        return session ? JSON.parse(session) : null;
    } catch (e) {
        return null;
    }
};

export const checkAuthState = (callback) => {
    const session = getCurrentUser();
    if (session) {
        callback(session);
    } else {
        callback(null);
    }
};
