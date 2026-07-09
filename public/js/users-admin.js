// Admin users.js - User management

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

async function loadUsers(page = 1) {
    try {
        const token = localStorage.getItem('token');
        currentPage = page;

        const response = await fetch(`/api/admin/users?page=${page}&limit=20`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to load users');

        const data = await response.json();

        // Update stats
        document.getElementById('totalUsers').textContent = data.stats?.total || 0;
        document.getElementById('activatedUsers').textContent = data.stats?.activated || 0;
        document.getElementById('sellersCount').textContent = data.stats?.sellers || 0;
        document.getElementById('suspendedCount').textContent = data.stats?.suspended || 0;

        displayUsersTable(data.users || []);
        displayPagination(data.pagination || {});

    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr><td colspan="6" class="error-message">Error loading users</td></tr>
        `;
    }
}

function displayUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    const html = users.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <div class="user-avatar">${user.firstName.charAt(0).toUpperCase()}</div>
                    <div class="user-details">
                        <div class="user-name">${user.firstName} ${user.lastName}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge status-${user.isActivated ? 'active' : 'inactive'}">
                    ${user.isActivated ? 'Activated' : 'Not Activated'}
                </span>
            </td>
            <td>
                <span class="status-badge status-${user.isSeller ? 'verified' : 'inactive'}">
                    ${user.isSeller ? 'Seller' : 'Buyer'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-small" onclick="viewUser('${user._id}')">View</button>
                ${!user.isSeller ? `
                    <button class="btn-small btn-verify" onclick="verifySeller('${user._id}')">Verify</button>
                ` : ''}
                ${!user.isSuspended ? `
                    <button class="btn-small btn-danger" onclick="suspendUser('${user._id}')">Suspend</button>
                ` : ''}
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="loadUsers(1)">← Previous</button>';
    
    for (let i = 1; i <= pagination.pages; i++) {
        html += `<button onclick="loadUsers(${i})" ${i === currentPage ? 'class="active"' : ''}>${i}</button>`;
    }
    
    html += `<button onclick="loadUsers(${pagination.pages})">Next →</button>`;
    container.innerHTML = html;
}

function viewUser(userId) {
    const token = localStorage.getItem('token');
    fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('userDetailName').textContent = `${data.firstName} ${data.lastName}`;
        document.getElementById('userDetailEmail').textContent = data.email;
        document.getElementById('userDetailPhone').textContent = data.phone || 'N/A';
        document.getElementById('userDetailUniversity').textContent = data.university || 'N/A';
        document.getElementById('userDetailStatus').innerHTML = `
            <span class="status-badge status-${data.isActivated ? 'active' : 'inactive'}">
                ${data.isActivated ? 'Activated' : 'Not Activated'}
            </span>
        `;
        document.getElementById('userDetailType').innerHTML = `
            <span class="status-badge status-${data.isSeller ? 'verified' : 'inactive'}">
                ${data.isSeller ? 'Seller' : 'Buyer'}
            </span>
        `;
        document.getElementById('userDetailJoined').textContent = new Date(data.createdAt).toLocaleDateString();
        
        if (data.isSeller) {
            document.getElementById('sellerStats').style.display = 'block';
            document.getElementById('sellerNotes').textContent = data.notesCount || 0;
            document.getElementById('sellerEarnings').textContent = (data.earnings || 0) + ' KES';
            document.getElementById('sellerRating').textContent = data.rating || 'N/A';
        } else {
            document.getElementById('sellerStats').style.display = 'none';
        }

        document.getElementById('userDetailModal').classList.add('show');
        document.getElementById('userDetailModal').dataset.userId = userId;
    })
    .catch(err => {
        console.error('Error loading user:', err);
        alert('Error loading user details');
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

async function verifySeller(userId) {
    if (!confirm('Verify this user as a seller?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}/verify-seller`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Verification failed');

        alert('User verified as seller!');
        loadUsers(currentPage);

    } catch (error) {
        console.error('Error verifying seller:', error);
        alert('Error verifying seller');
    }
}

async function suspendUser(userId) {
    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/users/${userId}/suspend`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        if (!response.ok) throw new Error('Suspension failed');

        alert('User suspended!');
        loadUsers(currentPage);

    } catch (error) {
        console.error('Error suspending user:', error);
        alert('Error suspending user');
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
    
    loadUsers(1);
    
    // Modal controls
    document.getElementById('closeUserDetailBtn')?.addEventListener('click', () => closeModal('userDetailModal'));

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});
