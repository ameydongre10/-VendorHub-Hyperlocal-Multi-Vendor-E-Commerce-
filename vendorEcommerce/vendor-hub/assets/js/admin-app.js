import { getPendingVendors, updateVendorStatus, getPlatformAnalytics } from "./modules/admin.js";
import { checkAuthState, logoutUser } from "./modules/auth.js";
import { initTheme, toggleTheme } from "./utils/theme-handler.js";
import { showToast, formatDate, escapeHtml } from "./utils/helpers.js";

// Check Admin Authentication
checkAuthState((user) => {
    if (!user || user.role !== 'admin') {
        alert("ACCESS DENIED: Administrator clearance required.");
        window.location.href = "../auth/login.html";
        return;
    }
});

// Initialize Theme
initTheme();

// Wire up global theme toggle if present
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Wire up global logout button if present
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser().then(() => {
            window.location.href = "../auth/login.html";
        });
    });
}

/**
 * Loads pending vendor requests on the vendor-requests page.
 */
export async function loadRequests() {
    const container = document.getElementById('vendor-list');
    const noRequestsMsg = document.getElementById('no-requests');
    const table = document.getElementById('requests-table');
    
    if (!container) return; // Not on the vendor requests page

    try {
        const requests = await getPendingVendors();

        if (requests.length === 0) {
            if (table) table.style.display = "none";
            if (noRequestsMsg) noRequestsMsg.style.display = "block";
            return;
        }

        if (table) table.style.display = "table";
        if (noRequestsMsg) noRequestsMsg.style.display = "none";

        container.innerHTML = "";
        requests.forEach(vendor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${escapeHtml(vendor.name || 'Unnamed Vendor')}</strong></td>
                <td>${escapeHtml(vendor.email || 'N/A')}</td>
                <td>${formatDate(vendor.createdAt)}</td>
                <td>
                    <button class="approve-btn" data-id="${escapeHtml(vendor.id)}">Approve</button>
                    <button class="reject-btn" data-id="${escapeHtml(vendor.id)}">Reject</button>
                </td>
            `;
            container.appendChild(row);
        });

        // Attach Event Listeners to buttons
        container.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'approved'));
        });

        container.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'rejected'));
        });
    } catch (err) {
        console.error("Error loading vendor requests:", err);
        showToast("Failed to load vendor requests", "error");
    }
}

async function handleStatusUpdate(vendorId, newStatus) {
    const action = newStatus === 'approved' ? 'approve' : 'reject';
    if (confirm(`Are you sure you want to ${action} this vendor application?`)) {
        try {
            const res = await updateVendorStatus(vendorId, newStatus);
            if (res.success) {
                showToast(`Vendor ${newStatus} successfully!`, "success");
                loadRequests(); // Refresh the list
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            showToast("Error updating status: " + error.message, "error");
        }
    }
}

/**
 * Loads platform analytics on the analytics page.
 */
export async function loadAnalytics() {
    const salesEl = document.getElementById('total-sales');
    if (!salesEl) return; // Not on the analytics page

    try {
        const stats = await getPlatformAnalytics();

        salesEl.innerText = stats.totalSales.toFixed(2);
        
        const ordersEl = document.getElementById('total-orders');
        if (ordersEl) ordersEl.innerText = stats.totalOrders;

        const revEl = document.getElementById('platform-revenue');
        if (revEl) revEl.innerText = stats.platformRevenue.toFixed(2);

        const vendorsCountEl = document.getElementById('total-vendors');
        if (vendorsCountEl) vendorsCountEl.innerText = stats.vendorCount;

        const buyersCountEl = document.getElementById('total-buyers');
        if (buyersCountEl) buyersCountEl.innerText = stats.buyerCount;
        
    } catch (error) {
        console.error("Error loading analytics:", error);
        showToast("Error loading analytics data", "error");
    }
}

// Ensure functions run if corresponding page elements exist
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vendor-list')) {
        loadRequests();
    }
    if (document.getElementById('total-sales')) {
        loadAnalytics();
    }
});
