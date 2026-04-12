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
        await setDoc(doc(db, "users", userId), {
            uid: userId,
            email: email,
            password: password, 
            role: userData.role,
            name: userData.name,
            status: userData.role === "seller" ? "pending" : "approved",
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem("userSession", JSON.stringify({ uid: userId, role: userData.role }));
        return { success: true };
    } catch (error) {
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

        localStorage.setItem("userSession", JSON.stringify({ 
            uid: userData.uid, 
            role: userData.role,
            status: userData.status 
        }));

        return { success: true, role: userData.role, status: userData.status };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = () => {
    localStorage.removeItem("userSession");
    return Promise.resolve();
};

export const checkAuthState = (callback) => {
    const session = JSON.parse(localStorage.getItem("userSession"));
    if (session) {
        callback(session);
    } else {
        callback(null);
    }
};