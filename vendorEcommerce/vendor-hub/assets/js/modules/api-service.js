/**
 * api-service.js
 * Centralized service layer for Firestore operations and Gemini AI API calls.
 */

import { db } from '../config/firebase-config.js';
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const COLLECTIONS = {
  USERS: 'users', PRODUCTS: 'products',
  ORDERS: 'orders', REVIEWS: 'reviews'
};

const snapToDoc  = (snap)  => ({ id: snap.id, ...snap.data() });
const snapsToDocs = (snaps) => snaps.docs.map(snapToDoc);

async function safeGet(ref) {
  const snap = await getDoc(ref);
  return snap.exists() ? snapToDoc(snap) : null;
}

async function safeQuery(q) {
  try { return snapsToDocs(await getDocs(q)); }
  catch (err) { console.error('[api-service]', err); return []; }
}

// ─── Products API ─────────────────────────────────────────────────────────────
export const ProductsAPI = {
  async getAll() {
    return safeQuery(query(collection(db, COLLECTIONS.PRODUCTS)));
  },
  async getById(id) {
    return safeGet(doc(db, COLLECTIONS.PRODUCTS, id));
  },
  async getByVendor(vendorId) {
    return safeQuery(query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('vendorId', '==', vendorId)
    ));
  },
  async getByCategory(category) {
    return safeQuery(query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('category', '==', category)
    ));
  },
  async search(term) {
    const all = await this.getAll();
    const t   = term.toLowerCase();
    return all.filter(p =>
      p.name?.toLowerCase().includes(t) ||
      p.description?.toLowerCase().includes(t) ||
      p.category?.toLowerCase().includes(t)
    );
  },
  async add(data) {
    const ref = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...data, createdAt: new Date().toISOString()
    });
    return { success: true, id: ref.id };
  },
  async update(id, data) {
    await updateDoc(doc(db, COLLECTIONS.PRODUCTS, id), data);
    return { success: true };
  },
  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
    return { success: true };
  }
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const OrdersAPI = {
  async getById(id) {
    return safeGet(doc(db, COLLECTIONS.ORDERS, id));
  },
  async getByBuyer(buyerId) {
    return safeQuery(query(
      collection(db, COLLECTIONS.ORDERS),
      where('buyerId', '==', buyerId)
    ));
  },
  async getByVendor(vendorId) {
    return safeQuery(query(
      collection(db, COLLECTIONS.ORDERS),
      where('vendorIds', 'array-contains', vendorId)
    ));
  },
  async create(buyerId, productIds, total, vendorIds) {
    const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), {
      buyerId, productIds, vendorIds,
      totalAmount: total,
      status: 'Placed',
      createdAt: new Date().toISOString()
    });
    return { success: true, orderId: ref.id };
  },
  async updateStatus(id, status) {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, id), { status });
    return { success: true };
  }
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const UsersAPI = {
  async getById(id) {
    return safeGet(doc(db, COLLECTIONS.USERS, id));
  },
  async getAll() {
    return safeQuery(query(collection(db, COLLECTIONS.USERS)));
  },
  async getPendingSellers() {
    return safeQuery(query(
      collection(db, COLLECTIONS.USERS),
      where('role',   '==', 'seller'),
      where('status', '==', 'pending')
    ));
  },
  async updateStatus(id, status) {
    await updateDoc(doc(db, COLLECTIONS.USERS, id), { status });
    return { success: true };
  }
};

// ─── Gemini AI API ────────────────────────────────────────────────────────────
export const GeminiAPI = {
  async generateProductDescription(name, category, features) {
    const apiKey = window.__env?.VITE_GEMINI_API_KEY || '';
    if (!apiKey) return { success: false, error: 'Gemini API key not configured' };

    try {
      const prompt = `Write a compelling 2-3 sentence product description for: ${name}. Category: ${category}. Features: ${features}. Make it engaging and persuasive for online shoppers.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { success: true, text };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
