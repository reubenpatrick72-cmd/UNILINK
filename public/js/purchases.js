// Purchases page JavaScript
let currentPage = 1;
let currentFilters = {
    search: '',
    status: 'all',
    sort: 'newest'
};

async function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadPurchases(page = 1) {
    try {
        currentPage = page;
        const token = localStorage.getItem('token');
        
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            sort: currentFilters.sort
        });

        const response = await fetch(`/api/purchases/my-purchases?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load purchases');

        const data = await response.json();
        displayPurchases(data.data || []);
        displayPagination(data.pagination || {});
        updatePurchasesCount(data.pagination?.total || 0);
    } catch (error) {
        console.error('Error loading purchases:', error);
        document.getElementById('purchasesList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading purchases. Please try again.</p>
            </div>
        `;
    }
}

function displayPurchases(purchases) {
    const container = document.getElementById('purchasesList');
    
    if (purchases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>No purchases yet. Start shopping in the marketplace!</p>
            </div>
        `;
        return;
    }

    const html = purchases.map(purchase => `
        <div class="purchase-card">
            <div class="purchase-header">
                <div class="purchase-title">
                    <h3>${purchase.noteTitle || 'Untitled Note'}</h3>
                </div>
                <div class="purchase-status ${purchase.expiryDate && new Date(purchase.expiryDate) > new Date() ? 'status-active' : 'status-expired'}">
                    ${purchase.expiryDate && new Date(purchase.expiryDate) > new Date() ? 'Active' : 'Expired'}
                </div>
            </div>
            <div class="purchase-meta">
                <span><i class="fas fa-user"></i> ${purchase.sellerName || 'Unknown Seller'}</span>
                <span><i class="fas fa-book"></i> ${purchase.amount} KES</span>
                <span><i class="fas fa-calendar"></i> ${new Date(purchase.purchaseDate).toLocaleDateString()}</span>
                <span class="meta-badge">${purchase.downloadCount || 0}/${purchase.maxDownloads || 10} Downloads</span>
            </div>
            <div class="purchase-actions">
                <button class="btn-download" onclick="downloadNote('${purchase._id}')" 
                    ${purchase.expiryDate && new Date(purchase.expiryDate) <= new Date() ? 'disabled' : ''}>
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-review" onclick="openReviewModal('${purchase._id}', '${purchase.noteTitle}')" 
                    ${purchase.hasReviewed ? 'disabled' : ''}>
                    <i class="fas fa-star"></i> ${purchase.hasReviewed ? 'Reviewed' : 'Leave Review'}
                </button>
            </div>
            <div class="access-info">
                <strong>Access Info:</strong><br>
                ${purchase.expiryDate ? `Expires: ${new Date(purchase.expiryDate).toLocaleDateString()}` : 'No expiration'}<br>
                Downloads remaining: ${(purchase.maxDownloads || 10) - (purchase.downloadCount || 0)}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="loadPurchases(1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadPurchases(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadPurchases(${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

function updatePurchasesCount(total) {
    const element = document.getElementById('purchasesCount');
    if (element) {
        element.textContent = `${total} purchase${total !== 1 ? 's' : ''}`;
    }
}

async function downloadNote(purchaseId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/purchases/download/${purchaseId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Failed to download note');
            return;
        }

        const data = await response.json();
        
        // Create download link
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.fullContent || '');
        link.download = `note-${purchaseId}.txt`;
        link.click();
        
        // Reload to update download count
        loadPurchases(currentPage);
    } catch (error) {
        console.error('Error downloading note:', error);
        alert('Error downloading note');
    }
}

function openReviewModal(purchaseId, noteTitle) {
    const modal = document.getElementById('reviewModal');
    document.getElementById('reviewNoteInfo').innerHTML = `
        <h3>${noteTitle}</h3>
        <p style="color: #666; margin: 10px 0 0 0;">Share your feedback about this note</p>
    `;
    modal.classList.add('show');
    
    // Store purchaseId for form submission
    document.getElementById('reviewForm').dataset.purchaseId = purchaseId;
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function applyFilters() {
    currentFilters.search = document.getElementById('searchInput')?.value || '';
    currentFilters.status = document.getElementById('statusFilter')?.value || 'all';
    currentFilters.sort = document.querySelector('[data-sort].active')?.dataset.sort || 'newest';
    
    currentPage = 1;
    loadPurchases(1);
}

function clearFilters() {
    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('statusFilter')) document.getElementById('statusFilter').value = 'all';
    
    document.querySelectorAll('[data-sort]').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-sort="newest"]').classList.add('active');
    
    currentFilters = { search: '', status: 'all', sort: 'newest' };
    loadPurchases(1);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;
    
    loadPurchases(1);
    
    // Setup filter listeners
    document.getElementById('searchInput')?.addEventListener('change', applyFilters);
    document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
    
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters();
        });
    });

    // Review form submission
    document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const purchaseId = e.target.dataset.purchaseId;
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const title = document.getElementById('reviewTitle')?.value;
        const comment = document.getElementById('reviewComment')?.value;
        
        if (!rating) {
            alert('Please select a rating');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/reviews/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    purchaseId,
                    rating: parseInt(rating),
                    title,
                    comment,
                    aspects: {
                        accuracy: parseInt(document.querySelector('input[name="accuracy"]').value),
                        completeness: parseInt(document.querySelector('input[name="completeness"]').value),
                        clarity: parseInt(document.querySelector('input[name="clarity"]').value),
                        relevance: parseInt(document.querySelector('input[name="relevance"]').value)
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to submit review');

            alert('Review submitted successfully!');
            closeModal('reviewModal');
            loadPurchases(currentPage);
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review');
        }
    });

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
