import { getPendingVendors, updateVendorStatus } from "./modules/admin.js";

async function loadRequests() {
    const container = document.getElementById('vendor-list');
    const noRequestsMsg = document.getElementById('no-requests');
    const table = document.getElementById('requests-table');
    
    // 1. Fetch vendors with status "pending" and role "seller"
    const requests = await getPendingVendors();

    if (requests.length === 0) {
        table.style.display = "none";
        noRequestsMsg.style.display = "block";
        return;
    }

    container.innerHTML = "";
    requests.forEach(vendor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${vendor.name}</td>
            <td>${vendor.email}</td>
            <td>${new Date(vendor.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="approve-btn" data-id="${vendor.id}">Approve</button>
                <button class="reject-btn" data-id="${vendor.id}">Reject</button>
            </td>
        `;
        container.appendChild(row);
    });

    // Attach Event Listeners to buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'approved'));
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', () => handleStatusUpdate(btn.dataset.id, 'rejected'));
    });
}

async function handleStatusUpdate(vendorId, newStatus) {
    if (confirm(`Are you sure you want to set this vendor to ${newStatus}?`)) {
        try {
            await updateVendorStatus(vendorId, newStatus);
            alert(`Vendor ${newStatus} successfully!`);
            loadRequests(); // Refresh the list
        } catch (error) {
            alert("Error updating status: " + error.message);
        }
    }
}



import { getPlatformAnalytics } from "./modules/admin.js";

async function loadAnalytics() {
    // Check if we are on the analytics page
    const salesEl = document.getElementById('total-sales');
    if (!salesEl) return; 

    try {
        // 1. Fetch data using your existing module
        const stats = await getPlatformAnalytics();

        // 2. Calculate platform commission (assuming 10% fee)
        const revenue = stats.totalSales * 0.10;

        // 3. Update the UI
        salesEl.innerText = stats.totalSales.toFixed(2);
        document.getElementById('total-orders').innerText = stats.totalOrders;
        document.getElementById('platform-revenue').innerText = revenue.toFixed(2);
        
    } catch (error) {
        console.error("Error loading analytics:", error);
    }
}

// Ensure the function runs when the page loads
document.addEventListener('DOMContentLoaded', loadAnalytics);


// Initial Load
loadRequests();