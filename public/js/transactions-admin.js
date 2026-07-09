// Admin transactions.js - Payment monitoring and refunds

let currentPage = 1;

async function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.isAdmin) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadTransactions(page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentPage = page;

        const response = await fetch(`/api/admin/transactions?page=${page}&limit=15`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load transactions');

        const data = await response.json();

        // Update stats
        document.getElementById('totalTransactions').textContent = data.stats?.total || 0;
        document.getElementById('totalRevenue').textContent = (data.stats?.revenue || 0) + ' KES';
        document.getElementById('completedCount').textContent = data.stats?.completed || 0;
        document.getElementById('pendingCount').textContent = data.stats?.pending || 0;

        displayTransactionsTable(data.transactions || []);
        displayPagination(data.pagination || {});

    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactionsTableBody').innerHTML = `
            <tr><td colspan="7" class="error-message">Error loading transactions</td></tr>
        `;
    }
}

function displayTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #999;">
                    No transactions found
                </td>
            </tr>
        `;
        return;
    }

    const html = transactions.map(t => {
        const platformShare = Math.round(t.amount * 0.2);
        const sellerShare = Math.round(t.amount * 0.8);

        return `
            <tr>
                <td>
                    <span class="transaction-id">${t._id.substring(0, 8).toUpperCase()}</span>
                </td>
                <td>
                    <div class="user-badge">${t.buyerName}</div>
                </td>
                <td>${t.noteTitle}</td>
                <td>
                    <span class="amount">${t.amount} KES</span>
                </td>
                <td>
                    <div class="commission-breakdown">
                        <div class="breakdown-item">
                            <i class="fas fa-building"></i> UniLink: ${platformShare} KES
                        </div>
                        <div class="breakdown-item">
                            <i class="fas fa-user"></i> Seller: ${sellerShare} KES
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${t.paymentStatus || 'pending'}">
                        ${(t.paymentStatus || 'pending').charAt(0).toUpperCase() + (t.paymentStatus || 'pending').slice(1)}
                    </span>
                </td>
                <td>
                    <span class="date">${new Date(t.purchaseDate).toLocaleDateString()}</span>
                </td>
                <td>
                    <button class="btn-small" onclick="viewTransaction('${t._id}')">View</button>
                    ${t.paymentStatus === 'completed' ? `
                        <button class="btn-small btn-danger" onclick="processRefund('${t._id}')">Refund</button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="loadTransactions(1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadTransactions(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadTransactions(${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

function viewTransaction(transactionId) {
    const token = localStorage.getItem('token');
    fetch(`/api/admin/transactions/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
        const platformShare = Math.round(data.amount * 0.2);
        const sellerShare = Math.round(data.amount * 0.8);

        document.getElementById('transDetailId').textContent = data._id;
        document.getElementById('transDetailBuyer').textContent = data.buyerName + ' (' + data.buyerEmail + ')';
        document.getElementById('transDetailSeller').textContent = data.sellerName + ' (' + data.sellerEmail + ')';
        document.getElementById('transDetailNote').textContent = data.noteTitle;
        document.getElementById('transDetailAmount').textContent = data.amount + ' KES';
        
        document.getElementById('transDetailBreakdown').innerHTML = `
            <div class="breakdown-full">
                <div class="breakdown-row">
                    <span>Gross Amount:</span>
                    <strong>${data.amount} KES</strong>
                </div>
                <div class="breakdown-row">
                    <span>Platform Commission (20%):</span>
                    <strong style="color: #667eea;">+ ${platformShare} KES</strong>
                </div>
                <div class="breakdown-row">
                    <span>Seller Payout (80%):</span>
                    <strong style="color: #27ae60;">+ ${sellerShare} KES</strong>
                </div>
            </div>
        `;
        
        document.getElementById('transDetailMethod').textContent = data.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card';
        document.getElementById('transDetailStatus').innerHTML = `
            <span class="status-badge status-${data.paymentStatus}">
                ${data.paymentStatus.charAt(0).toUpperCase() + data.paymentStatus.slice(1)}
            </span>
        `;
        document.getElementById('transDetailDate').textContent = new Date(data.purchaseDate).toLocaleDateString();

        document.getElementById('transactionDetailModal').classList.add('show');
        document.getElementById('transactionDetailModal').dataset.transactionId = transactionId;
    })
    .catch(err => {
        console.error('Error loading transaction:', err);
        alert('Error loading transaction details');
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function processRefund(transactionId) {
    const reason = prompt('Enter reason for refund:');
    if (!reason) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/transactions/${transactionId}/refund`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) throw new Error('Refund failed');

        alert('Refund processed successfully!');
        loadTransactions(currentPage);

    } catch (error) {
        console.error('Error processing refund:', error);
        alert('Error processing refund');
    }
}

function filterTransactions() {
    const status = document.getElementById('statusFilter')?.value;
    const method = document.getElementById('methodFilter')?.value;
    const search = document.getElementById('searchInput')?.value;

    // Implement filtering - for now, reload all
    loadTransactions(1);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAdminAuth()) return;
    
    loadTransactions(1);
    
    // Filter listeners
    document.getElementById('statusFilter')?.addEventListener('change', filterTransactions);
    document.getElementById('methodFilter')?.addEventListener('change', filterTransactions);
    document.getElementById('searchInput')?.addEventListener('keyup', filterTransactions);

    // Modal controls
    document.getElementById('closeTransDetailBtn')?.addEventListener('click', () => closeModal('transactionDetailModal'));

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
