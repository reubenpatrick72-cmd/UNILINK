// Seller earnings.js - Track earnings and manage withdrawals

let currentEarningsPage = 1;

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadEarnings() {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('/api/seller/earnings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load earnings');

        const data = await response.json();

        // Update stats
        document.getElementById('pendingEarnings').textContent = (data.pendingEarnings || 0) + ' KES';
        document.getElementById('availableBalance').textContent = (data.availableBalance || 0) + ' KES';
        document.getElementById('totalWithdrawn').textContent = (data.totalWithdrawn || 0) + ' KES';
        document.getElementById('totalSales').textContent = data.totalSales || 0;

        // Update earnings summary
        document.getElementById('thisMonthEarnings').textContent = (data.thisMonth || 0) + ' KES';
        document.getElementById('lastMonthEarnings').textContent = (data.lastMonth || 0) + ' KES';
        document.getElementById('allTimeEarnings').textContent = (data.allTime || 0) + ' KES';

        // Display withdrawals
        displayWithdrawals(data.withdrawals || []);

        // Display sales
        loadRecentSales();

    } catch (error) {
        console.error('Error loading earnings:', error);
        alert('Error loading earnings data');
    }
}

function displayWithdrawals(withdrawals) {
    const container = document.getElementById('withdrawalsList');
    
    if (withdrawals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wallet"></i>
                <p>No withdrawals yet. Make your first withdrawal to see it here.</p>
            </div>
        `;
        return;
    }

    const html = withdrawals.map(w => `
        <div class="withdrawal-card">
            <div class="withdrawal-header">
                <div class="withdrawal-amount">${w.amount} KES</div>
                <span class="status-badge status-${w.status || 'pending'}">
                    ${(w.status || 'pending').charAt(0).toUpperCase() + (w.status || 'pending').slice(1)}
                </span>
            </div>
            <div class="withdrawal-details">
                <div class="detail-row">
                    <span>Payment Method:</span>
                    <strong>${w.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}</strong>
                </div>
                <div class="detail-row">
                    <span>Requested:</span>
                    <strong>${new Date(w.createdAt).toLocaleDateString()}</strong>
                </div>
                ${w.completedAt ? `
                    <div class="detail-row">
                        <span>Completed:</span>
                        <strong>${new Date(w.completedAt).toLocaleDateString()}</strong>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span>Fee:</span>
                    <strong>${w.fee || 0} KES</strong>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

async function loadRecentSales(page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentEarningsPage = page;

        const response = await fetch(`/api/purchases/my-sales?page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load sales');

        const data = await response.json();
        displaySalesTable(data.data || []);
        displaySalesPagination(data.pagination || {});

    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

function displaySalesTable(sales) {
    const tbody = document.getElementById('salesTableBody');
    
    if (sales.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-shopping-bag" style="font-size: 2rem; color: #ddd;"></i>
                    <p style="color: #999; margin-top: 10px;">No sales yet</p>
                </td>
            </tr>
        `;
        return;
    }

    const html = sales.map(sale => `
        <tr>
            <td>
                <div class="sale-buyer">
                    <strong>${sale.buyerName}</strong>
                </div>
            </td>
            <td>${sale.noteTitle}</td>
            <td><span class="amount">${sale.amount} KES</span></td>
            <td>
                <div class="earnings-breakdown">
                    <div>You: <strong>${Math.round(sale.amount * 0.8)} KES</strong></div>
                    <div style="font-size: 0.9rem; color: #666;">Commission: ${Math.round(sale.amount * 0.2)} KES</div>
                </div>
            </td>
            <td>${new Date(sale.purchaseDate).toLocaleDateString()}</td>
            <td><span class="status-badge status-completed">Completed</span></td>
        </tr>
    `).join('');

    tbody.innerHTML = html;
}

function displaySalesPagination(pagination) {
    const container = document.getElementById('salesPagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="loadRecentSales(1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadRecentSales(${i})" ${i === currentEarningsPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadRecentSales(${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

function openWithdrawalModal() {
    const balance = document.getElementById('availableBalance').textContent;
    document.getElementById('maxAmount').textContent = balance;
    document.getElementById('withdrawalModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function calculateFee() {
    const amount = parseInt(document.getElementById('withdrawAmount').value) || 0;
    const fee = Math.round(amount * 0.02); // 2% fee
    const net = amount - fee;
    
    document.getElementById('feeCost').textContent = fee + ' KES';
    document.getElementById('netAmount').textContent = net + ' KES';
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;
    
    loadEarnings();
    
    // Withdrawal amount input listener
    document.getElementById('withdrawAmount')?.addEventListener('input', calculateFee);
    
    // Withdrawal form submission
    document.getElementById('withdrawalForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const amount = parseInt(document.getElementById('withdrawAmount').value);
        const method = document.getElementById('paymentMethod').value;
        const detail = document.getElementById('paymentDetail').value;

        if (!amount || !method) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            const response = await fetch('/api/seller/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, method, detail })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Withdrawal request failed');
            }

            alert('Withdrawal request submitted! You will receive your funds within 2-3 business days.');
            closeModal('withdrawalModal');
            e.target.reset();
            loadEarnings();

        } catch (error) {
            console.error('Error processing withdrawal:', error);
            alert(error.message || 'Error processing withdrawal');
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal';
        }
    });

    // Modal controls
    document.getElementById('openWithdrawalBtn')?.addEventListener('click', openWithdrawalModal);
    document.getElementById('cancelWithdrawalBtn')?.addEventListener('click', () => closeModal('withdrawalModal'));

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/pages/auth/login.html';
    });
});
