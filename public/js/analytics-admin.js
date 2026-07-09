// Admin analytics.js - Platform analytics and reporting

let selectedPeriod = '30';

async function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.isAdmin) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadAnalytics(period = '30') {
    try {
        const token = localStorage.getItem('token');
        selectedPeriod = period;

        const response = await fetch(`/api/admin/analytics?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load analytics');

        const data = await response.json();

        // Update KPI cards
        document.getElementById('totalRevenue').textContent = (data.stats?.totalRevenue || 0) + ' KES';
        document.getElementById('totalUsers').textContent = data.stats?.totalUsers || 0;
        document.getElementById('totalNotes').textContent = data.stats?.totalNotes || 0;
        document.getElementById('totalSales').textContent = data.stats?.totalSales || 0;

        // Update comparisons
        document.getElementById('revenueChange').textContent = data.stats?.revenueChange || '+0%';
        document.getElementById('usersChange').textContent = data.stats?.usersChange || '+0%';
        document.getElementById('notesChange').textContent = data.stats?.notesChange || '+0%';
        document.getElementById('salesChange').textContent = data.stats?.salesChange || '+0%';

        // Load performers
        loadTopPerformers(data);

    } catch (error) {
        console.error('Error loading analytics:', error);
        alert('Error loading analytics data');
    }
}

function loadTopPerformers(data) {
    const topNotes = data.topNotes || [];
    const topSellers = data.topSellers || [];
    const topBuyers = data.topBuyers || [];

    // Display top notes
    const notesHtml = topNotes.map((note, index) => `
        <div class="top-item">
            <div class="item-rank">
                <span class="rank-badge rank-${index + 1 <= 3 ? index + 1 : ''}">
                    ${index + 1}
                </span>
            </div>
            <div class="item-content">
                <div class="item-title">${note.title}</div>
                <div class="item-meta">${note.course} - ${note.unit}</div>
            </div>
            <div class="item-value">
                <div>${note.downloads || 0} downloads</div>
                <div class="value-secondary">${note.sales || 0} sales</div>
            </div>
        </div>
    `).join('');
    document.getElementById('topNotesList').innerHTML = notesHtml;

    // Display top sellers
    const sellersHtml = topSellers.map((seller, index) => `
        <div class="top-item">
            <div class="item-rank">
                <span class="rank-badge rank-${index + 1 <= 3 ? index + 1 : ''}">
                    ${index + 1}
                </span>
            </div>
            <div class="item-content">
                <div class="item-title">${seller.name}</div>
                <div class="item-meta">${seller.email}</div>
            </div>
            <div class="item-value">
                <div>${seller.earnings || 0} KES</div>
                <div class="value-secondary">${seller.notes || 0} notes</div>
            </div>
        </div>
    `).join('');
    document.getElementById('topSellersList').innerHTML = sellersHtml;

    // Display top buyers
    const buyersHtml = topBuyers.map((buyer, index) => `
        <div class="top-item">
            <div class="item-rank">
                <span class="rank-badge rank-${index + 1 <= 3 ? index + 1 : ''}">
                    ${index + 1}
                </span>
            </div>
            <div class="item-content">
                <div class="item-title">${buyer.name}</div>
                <div class="item-meta">${buyer.email}</div>
            </div>
            <div class="item-value">
                <div>${buyer.spending || 0} KES</div>
                <div class="value-secondary">${buyer.purchases || 0} purchases</div>
            </div>
        </div>
    `).join('');
    document.getElementById('topBuyersList').innerHTML = buyersHtml;
}

async function loadMetrics(period = '30') {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/api/admin/analytics/metrics?period=${period}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load metrics');

        const data = await response.json();

        // Update key metrics
        document.getElementById('avgOrderValue').textContent = (data.metrics?.avgOrderValue || 0) + ' KES';
        document.getElementById('activeSellers').textContent = data.metrics?.activeSellers || 0;
        document.getElementById('avgRating').textContent = (data.metrics?.avgRating || 0).toFixed(2);
        document.getElementById('conversionRate').textContent = (data.metrics?.conversionRate || 0) + '%';

    } catch (error) {
        console.error('Error loading metrics:', error);
    }
}

function changePeriod(period) {
    document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadAnalytics(period);
    loadMetrics(period);
}

function exportReport() {
    try {
        const token = localStorage.getItem('token');
        
        // Create a download link for the report
        const link = document.createElement('a');
        link.href = `/api/admin/analytics/export?period=${selectedPeriod}`;
        link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Error exporting report');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAdminAuth()) return;
    
    // Load initial data
    loadAnalytics('30');
    loadMetrics('30');
    
    // Period selector
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changePeriod(this.dataset.period);
        });
    });

    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', exportReport);

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
