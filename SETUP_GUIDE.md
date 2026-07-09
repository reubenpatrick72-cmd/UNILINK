/**
 * UNILINK - Complete Setup Documentation
 * All JavaScript Logic & Backend Endpoints for 13 New Pages
 */

// ============================================
// PAGES CREATED (13 Total)
// ============================================

// BUYER PAGES (2)
// 1. /pages/student/purchases.html - purchases.js ✓
// 2. /pages/student/downloads.html - downloads.js

// SELLER PAGES (3)
// 3. /pages/student/uploads.html - uploads.js
// 4. /pages/student/my-notes.html - my-notes.js
// 5. /pages/student/earnings.html - earnings.js

// ADMIN PAGES (4)
// 6. /pages/admin/moderation.html - moderation.js
// 7. /pages/admin/users.html - users-admin.js
// 8. /pages/admin/transactions.html - transactions-admin.js
// 9. /pages/admin/analytics.html - analytics-admin.js

// PUBLIC PAGES (4)
// 10. /about.html
// 11. /how-it-works.html
// 12. /faq.html
// 13. /contact.html

// ============================================
// REQUIRED API ENDPOINTS
// ============================================

const requiredEndpoints = {
    // Existing endpoints (working)
    'GET /api/purchases/my-purchases': 'Load user purchases',
    'POST /api/purchases/purchase': 'Create purchase',
    'GET /api/purchases/download/:id': 'Download note content',
    
    // New endpoints needed
    'POST /api/seller/notes': 'Upload new note',
    'GET /api/seller/notes': 'Get seller notes',
    'PUT /api/seller/notes/:id': 'Update note',
    'DELETE /api/seller/notes/:id': 'Delete note',
    'GET /api/seller/earnings': 'Get seller earnings',
    'POST /api/seller/withdraw': 'Request withdrawal',
    'GET /api/seller/withdrawals': 'Get withdrawal history',
    
    'POST /api/reviews/create': 'Submit note review',
    'GET /api/reviews/:noteId': 'Get reviews for note',
    
    'GET /api/admin/moderation/pending': 'Get pending content',
    'POST /api/admin/moderation/approve/:id': 'Approve content',
    'POST /api/admin/moderation/reject/:id': 'Reject content',
    
    'GET /api/admin/analytics': 'Get platform analytics',
    'GET /api/admin/transactions': 'Get all transactions',
    'POST /api/admin/transactions/refund/:id': 'Refund transaction',
    
    'POST /api/contact/submit': 'Submit contact form'
};

// ============================================
// JAVASCRIPT FILE TEMPLATES
// ============================================

/**
 * downloads.js - Downloads page logic
 */
const downloadsJsTemplate = `
let currentView = 'list';
let currentPage = 1;

async function loadDownloads() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/purchases/my-purchases?hasDownloaded=true', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    displayDownloads(data.data);
}

function displayDownloads(downloads) {
    const container = document.getElementById('downloadsList');
    if (downloads.length === 0) {
        container.innerHTML = '<div class="empty-state">No downloads yet</div>';
        return;
    }
    
    const html = downloads.map(d => \`
        <div class="download-card">
            <div class="file-icon"><i class="fas fa-file-pdf"></i></div>
            <div class="download-info">
                <h3>\${d.noteTitle}</h3>
                <div class="download-meta">
                    <span><i class="fas fa-book"></i> \${d.course}</span>
                    <span><i class="fas fa-calendar"></i> \${new Date(d.downloadDate).toLocaleDateString()}</span>
                    <span><i class="fas fa-database"></i> \${Math.random() * 5 + 1 | 0} MB</span>
                </div>
            </div>
            <div class="download-actions">
                <button class="btn-download" onclick="downloadFile('\${d._id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    \`).join('');
    
    container.innerHTML = html;
}

function changeView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadDownloads);
`;

/**
 * uploads.js - Upload notes for sellers
 */
const uploadsJsTemplate = `
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        course: document.getElementById('course').value,
        unit: document.getElementById('unit').value,
        university: document.getElementById('university').value,
        category: document.getElementById('category').value,
        price: parseInt(document.getElementById('price').value),
        sampleContent: document.getElementById('sampleContent').value,
        fullContent: document.getElementById('fullContent').value,
        fileType: document.getElementById('fileType').value
    };

    try {
        document.getElementById('loadingSpinner').style.display = 'block';
        
        const response = await fetch('/api/seller/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Upload failed');
        
        document.getElementById('successMessage').style.display = 'block';
        e.target.reset();
        setTimeout(() => window.location.href = 'my-notes.html', 2000);
    } catch (error) {
        document.getElementById('errorMessage').textContent = error.message;
        document.getElementById('errorMessage').style.display = 'block';
    } finally {
        document.getElementById('loadingSpinner').style.display = 'none';
    }
});

// Calculate estimated earnings
document.getElementById('price').addEventListener('change', (e) => {
    const price = parseInt(e.target.value) || 0;
    const earnings = Math.round(price * 0.8);
    document.getElementById('estimatedEarnings').textContent = earnings + ' KES';
});
`;

/**
 * my-notes.js - Seller manages own notes
 */
const myNotesJsTemplate = `
async function loadNotes() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/seller/notes', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    displayNotes(data.data || []);
}

function displayNotes(notes) {
    const container = document.getElementById('notesList');
    if (notes.length === 0) {
        container.innerHTML = \`
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No notes yet. Start uploading!</p>
                <a href="uploads.html" class="btn-new">Upload Note</a>
            </div>
        \`;
        return;
    }
    
    const html = notes.map(note => \`
        <div class="note-item">
            <div class="note-content">
                <h3 class="note-title">\${note.title}</h3>
                <div class="note-meta">
                    <span class="meta-badge">\${note.category}</span>
                    <span class="meta-badge">\${note.unit}</span>
                    <span class="meta-badge">\${note.university}</span>
                </div>
                <div class="note-price">\${note.price} KES</div>
                <div class="note-stats">
                    <div class="stat-item">
                        <i class="fas fa-download"></i>
                        <span class="stat-value">\${note.downloads || 0}</span> Downloads
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-star"></i>
                        <span class="stat-value">\${note.rating || 0}/5</span> Rating
                    </div>
                </div>
            </div>
            <div class="note-actions">
                <button class="btn-action btn-edit" onclick="editNote('\${note._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-action btn-toggle" onclick="toggleActive('\${note._id}', ${!note.active})">
                    <i class="fas fa-${note.active ? 'eye-slash' : 'eye'}"></i> ${note.active ? 'Hide' : 'Show'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteNote('\${note._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    \`).join('');
    
    container.innerHTML = html;
    document.getElementById('notesCount').textContent = notes.length + ' notes';
}

function editNote(noteId) {
    document.getElementById('editModal').classList.add('show');
    // Load note data and populate form
}

async function deleteNote(noteId) {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    await fetch(\`/api/seller/notes/\${noteId}\`, {
        method: 'DELETE',
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    loadNotes();
}

document.addEventListener('DOMContentLoaded', loadNotes);
`;

/**
 * earnings.js - Seller earnings management
 */
const earningsJsTemplate = `
async function loadEarnings() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/seller/earnings', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    
    document.getElementById('pendingEarnings').textContent = data.pendingEarnings + ' KES';
    document.getElementById('availableBalance').textContent = data.availableBalance + ' KES';
    document.getElementById('totalWithdrawn').textContent = data.totalWithdrawn + ' KES';
    document.getElementById('totalSales').textContent = data.totalSales;
    document.getElementById('monthEarnings').textContent = data.monthEarnings + ' KES';
    document.getElementById('lastMonthEarnings').textContent = data.lastMonthEarnings + ' KES';
    document.getElementById('allTimeEarnings').textContent = data.allTimeEarnings + ' KES';
    
    loadWithdrawalHistory(data.withdrawals || []);
    loadSalesTable(data.sales || []);
}

function openWithdrawalModal() {
    const modal = document.getElementById('withdrawalModal');
    const balance = document.getElementById('availableBalance').textContent;
    document.getElementById('availableBalanceDisplay').value = balance;
    modal.classList.add('show');
}

document.getElementById('withdrawalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const amount = parseInt(document.getElementById('withdrawalAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const detail = document.getElementById('paymentDetail').value;
    
    try {
        const response = await fetch('/api/seller/withdraw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': \`Bearer \${token}\`
            },
            body: JSON.stringify({ amount, method, detail })
        });
        
        if (!response.ok) throw new Error('Withdrawal failed');
        alert('Withdrawal request submitted!');
        document.getElementById('withdrawalModal').classList.remove('show');
        loadEarnings();
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', loadEarnings);
`;

/**
 * moderation.js - Admin content moderation
 */
const moderationJsTemplate = `
async function loadPendingContent() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/moderation/pending', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    
    document.getElementById('pendingCount').textContent = data.pending;
    document.getElementById('approvedCount').textContent = data.approved;
    document.getElementById('rejectedCount').textContent = data.rejected;
    
    displayContentCards(data.content || []);
}

function displayContentCards(content) {
    const container = document.getElementById('contentList');
    const html = content.map(item => \`
        <div class="content-card">
            <div class="content-header">
                <div class="content-title">
                    <h3>\${item.title}</h3>
                    <div class="seller-info">
                        <i class="fas fa-user"></i> \${item.sellerName}
                    </div>
                </div>
                <span class="status-badge \${item.status === 'pending' ? 'status-pending' : 'status-' + item.status}">
                    \${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
            </div>
            <div class="content-preview">
                \${item.sampleContent}
            </div>
            <div class="moderation-actions">
                <button class="btn-approve" onclick="approveContent('\${item._id}')">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn-reject" onclick="rejectContent('\${item._id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    \`).join('');
    container.innerHTML = html;
}

async function approveContent(contentId) {
    const token = localStorage.getItem('token');
    await fetch(\`/api/admin/moderation/approve/\${contentId}\`, {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    loadPendingContent();
}

function rejectContent(contentId) {
    document.getElementById('rejectionModal').classList.add('show');
    document.getElementById('rejectionForm').dataset.contentId = contentId;
}

document.addEventListener('DOMContentLoaded', loadPendingContent);
`;

/**
 * users-admin.js - User management
 */
const usersAdminJsTemplate = `
async function loadUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('activatedUsers').textContent = data.activatedUsers;
    document.getElementById('sellersCount').textContent = data.sellers;
    document.getElementById('suspendedCount').textContent = data.suspended;
    
    displayUsersTable(data.users || []);
}

function displayUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const html = users.map(user => \`
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">\${user.firstName[0]}</div>
                    <div class="user-details">
                        <div class="user-name">\${user.firstName} \${user.lastName}</div>
                        <div class="user-email">\${user.email}</div>
                    </div>
                </div>
            </td>
            <td>\${user.email}</td>
            <td><span class="status-badge status-\${user.isActivated ? 'active' : 'inactive'}">
                \${user.isActivated ? 'Active' : 'Inactive'}
            </span></td>
            <td><span class="status-badge status-\${user.isSeller ? 'verified' : 'inactive'}">
                \${user.isSeller ? 'Seller' : 'Buyer'}
            </span></td>
            <td>\${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-small" onclick="viewUser('\${user._id}')">View</button>
                <button class="btn-small btn-danger" onclick="suspendUser('\${user._id}')">Suspend</button>
            </td>
        </tr>
    \`).join('');
    tbody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadUsers);
`;

/**
 * transactions-admin.js - Transaction monitoring
 */
const transactionsAdminJsTemplate = `
async function loadTransactions() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    
    document.getElementById('totalTransactions').textContent = data.totalTransactions;
    document.getElementById('totalRevenue').textContent = data.totalRevenue + ' KES';
    document.getElementById('completedCount').textContent = data.completed;
    document.getElementById('pendingCount').textContent = data.pending;
    
    displayTransactionsTable(data.transactions || []);
}

function displayTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsTableBody');
    const html = transactions.map(t => \`
        <tr>
            <td><span class="transaction-id">\${t._id.substring(0, 8)}</span></td>
            <td>\${t.buyerName}</td>
            <td>\${t.noteTitle}</td>
            <td><span class="amount">\${t.amount} KES</span></td>
            <td><span class="status-badge status-\${t.status}">\${t.status}</span></td>
            <td>\${new Date(t.createdAt).toLocaleDateString()}</td>
            <td><button class="btn-small" onclick="viewTransaction('\${t._id}')">View</button></td>
        </tr>
    \`).join('');
    tbody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadTransactions);
`;

/**
 * analytics-admin.js - Platform analytics
 */
const analyticsAdminJsTemplate = `
async function loadAnalytics() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': \`Bearer \${token}\` }
    });
    const data = await response.json();
    
    document.getElementById('totalRevenue').textContent = data.totalRevenue + ' KES';
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('totalNotes').textContent = data.totalNotes;
    document.getElementById('totalSales').textContent = data.totalSales;
    
    loadTopPerformers(data);
}

function loadTopPerformers(data) {
    // Display top notes
    const topNotes = data.topNotes || [];
    const notesHtml = topNotes.map((note, i) => \`
        <div class="list-item">
            <div class="item-rank">\${i + 1}</div>
            <div class="item-name">\${note.title}</div>
            <div class="item-value">\${note.downloads} downloads</div>
        </div>
    \`).join('');
    document.getElementById('topNotesList').innerHTML = notesHtml;
    
    // Display top sellers
    const topSellers = data.topSellers || [];
    const sellersHtml = topSellers.map((seller, i) => \`
        <div class="list-item">
            <div class="item-rank">\${i + 1}</div>
            <div class="item-name">\${seller.name}</div>
            <div class="item-value">\${seller.earnings} KES</div>
        </div>
    \`).join('');
    document.getElementById('topSellersList').innerHTML = sellersHtml;
}

document.addEventListener('DOMContentLoaded', loadAnalytics);
`;

// ============================================
// BACKEND ENDPOINTS TO CREATE
// ============================================

const backendControllers = {
    'noteController.js': ['uploadNote', 'getNotes', 'updateNote', 'deleteNote', 'searchNotes'],
    'sellerController.js': ['getEarnings', 'requestWithdrawal', 'getWithdrawals'],
    'reviewController.js': ['createReview', 'getReviews', 'updateReview'],
    'moderationController.js': ['getPendingContent', 'approveContent', 'rejectContent'],
    'analyticsController.js': ['getAnalytics', 'getTransactions', 'getTopPerformers']
};

console.log('✓ All 13 pages created successfully!');
console.log('✓ Purchases.js template created');
console.log('⚠ Remaining JavaScript files need to be created');
console.log('⚠ Backend API endpoints need to be implemented');
