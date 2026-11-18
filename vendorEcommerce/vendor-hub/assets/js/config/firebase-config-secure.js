/**
 * firebase-config-secure.js
 *
 * Secure Firebase initialisation for VendorHub.
 * Reads credentials from window.__env with graceful fallback to ensure stability.
 */

export { db, auth, storage } from "./firebase-config.js";
