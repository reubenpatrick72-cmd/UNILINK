// Admin moderation.js - Content approval and moderation

let currentPage = 1;
let currentStatus = 'pending';

async function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.isAdmin) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

async function loadPendingContent(status = 'pending', page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentPage = page;
        currentStatus = status;

        const response = await fetch(`/api/admin/moderation?status=${status}&page=${page}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load content');

        const data = await response.json();

        // Update stats
        document.getElementById('pendingCount').textContent = data.stats?.pending || 0;
        document.getElementById('approvedCount').textContent = data.stats?.approved || 0;
        document.getElementById('rejectedCount').textContent = data.stats?.rejected || 0;

        displayContentCards(data.content || []);
        displayPagination(data.pagination || {});

    } catch (error) {
        console.error('Error loading content:', error);
        document.getElementById('contentList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

function displayContentCards(content) {
    const container = document.getElementById('contentList');

    if (content.length === 0) {
        const statusText = currentStatus === 'pending' ? 'pending' : currentStatus;
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No ${statusText} content to moderate.</p>
            </div>
        `;
        return;
    }

    const html = content.map(item => `
        <div class="content-card">
            <div class="content-header">
                <div class="content-title">
                    <h3>${item.title}</h3>
                    <div class="seller-info">
                        <i class="fas fa-user"></i> ${item.sellerName}
                    </div>
                </div>
                <span class="status-badge status-${item.status}">
                    ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            </div>
            
            <div class="content-meta">
                <span><i class="fas fa-book"></i> ${item.course}</span>
                <span><i class="fas fa-tag"></i> ${item.unit}</span>
                <span><i class="fas fa-folder"></i> ${item.category}</span>
                <span><i class="fas fa-money"></i> ${item.price} KES</span>
            </div>

            <div class="content-description">
                <strong>Description:</strong>
                <p>${item.description}</p>
            </div>

            <div class="content-preview">
                <strong>Sample Content:</strong>
                <div class="preview-content">
                    ${item.sampleContent.substring(0, 200)}...
                </div>
            </div>

            <div class="seller-details">
                <strong>Seller Details:</strong>
                <p>
                    <span><i class="fas fa-envelope"></i> ${item.sellerEmail}</span><br>
                    <span><i class="fas fa-phone"></i> ${item.sellerPhone}</span><br>
                    <span><i class="fas fa-star"></i> Rating: ${item.sellerRating || 'N/A'}</span>
                </p>
            </div>

            <div class="moderation-actions">
                ${item.status === 'pending' ? `
                    <button class="btn-approve" onclick="approveContent('${item._id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="openRejectModal('${item._id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                ` : `
                    <button class="btn-secondary" disabled>
                        ${item.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </button>
                `}
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

    let html = '<button onclick="loadPendingContent(currentStatus, 1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadPendingContent(currentStatus, ${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadPendingContent(currentStatus, ${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

async function approveContent(contentId) {
    if (!confirm('Approve this content? The seller will be notified.')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/moderation/approve/${contentId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Approval failed');

        alert('Content approved!');
        loadPendingContent(currentStatus, currentPage);

    } catch (error) {
        console.error('Error approving content:', error);
        alert('Error approving content');
    }
}

function openRejectModal(contentId) {
    document.getElementById('rejectModal').classList.add('show');
    document.getElementById('rejectModal').dataset.contentId = contentId;
    document.getElementById('rejectionReason').value = '';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function submitRejection() {
    const modal = document.getElementById('rejectModal');
    const contentId = modal.dataset.contentId;
    const reason = document.getElementById('rejectionReason').value;

    if (!reason) {
        alert('Please provide a reason for rejection');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/moderation/reject/${contentId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) throw new Error('Rejection failed');

        alert('Content rejected. Seller has been notified.');
        closeModal('rejectModal');
        loadPendingContent(currentStatus, currentPage);

    } catch (error) {
        console.error('Error rejecting content:', error);
        alert('Error rejecting content');
    }
}

function filterByStatus(status) {
    document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadPendingContent(status, 1);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/auth/login.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAdminAuth()) return;
    
    loadPendingContent('pending', 1);
    
    // Status filter buttons
    document.querySelectorAll('.status-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            filterByStatus(this.dataset.status);
        });
    });

    // Modal controls
    document.getElementById('submitRejectBtn')?.addEventListener('click', submitRejection);
    document.getElementById('cancelRejectBtn')?.addEventListener('click', () => closeModal('rejectModal'));

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
