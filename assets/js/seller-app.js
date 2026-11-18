/**
 * seller-app.js
 *
 * Dedicated client-side controller for seller workflows.
 */

import { getVendorProducts, updateProductStock, deleteProduct } from "./modules/products.js";
import { getVendorStats, getLowStockProducts } from "./modules/vendor.js";
import { getVendorOrders, updateOrderStatus } from "./modules/orders.js";

export {
    getVendorProducts,
    updateProductStock,
    deleteProduct,
    getVendorStats,
    getLowStockProducts,
    getVendorOrders,
    updateOrderStatus
};
