import { auth } from "./config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Check if a user is already logged in and redirect them
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is logged in:", user.email);
        // You could auto-redirect here if needed
    } else {
        console.log("No user logged in.");
    }
});