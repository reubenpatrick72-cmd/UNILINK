// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    // Temporarily commented out to allow direct access for testing
    // if (!isLoggedIn() || !isAdmin()) {
    //     window.location.href = '../auth/login.html';
    //     return;
    // }

    // Initialize dashboard
    initializeDashboard();

    // Navigation handling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Load initial data
    loadDashboardStats();
    loadUsers();
});

function initializeDashboard() {
    const user = getUser();
    if (user) {
        document.getElementById('adminName').textContent = `Welcome, ${user.firstName}`;
        document.getElementById('sidebarName').textContent = `${user.firstName} ${user.lastName}`;
    }
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load section-specific data
    switch(sectionName) {
        case 'users':
            loadUsers();
            break;
        case 'tutorials':
            loadTutorials();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('totalUsers').textContent = data.totalUsers;
            document.getElementById('activatedUsers').textContent = data.activatedUsers;
            document.getElementById('totalTutorials').textContent = data.totalTutorials;
            document.getElementById('totalProgress').textContent = data.totalProgress;
        } else {
            console.error('Failed to load stats:', data.message);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadUsers(filter = 'all') {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayUsers(data.users, filter);
        } else {
            document.getElementById('usersTable').innerHTML = '<p style="color: red;">Failed to load users.</p>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTable').innerHTML = '<p style="color: red;">Error loading users.</p>';
    }
}

function displayUsers(users, filter) {
    let filteredUsers = users;

    switch(filter) {
        case 'activated':
            filteredUsers = users.filter(user => user.isActivated);
            break;
        case 'pending':
            filteredUsers = users.filter(user => !user.isActivated);
            break;
    }

    if (filteredUsers.length === 0) {
        document.getElementById('usersTable').innerHTML = '<p>No users found.</p>';
        return;
    }

    let html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f5f5f5;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Name</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Email</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">University</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Status</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;

    filteredUsers.forEach(user => {
        const status = user.isActivated ?
            '<span style="color: #10b981; font-weight: bold;">✓ Activated</span>' :
            '<span style="color: #f59e0b; font-weight: bold;">⏳ Pending</span>';

        html += `
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">${user.firstName} ${user.lastName}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${user.email}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${user.university}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">${status}</td>
                <td style="padding: 12px; border: 1px solid #ddd;">
                    ${!user.isActivated ? `<button class="btn btn-primary" onclick="activateUser('${user._id}')">Activate</button>` : ''}
                    <button class="btn btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    document.getElementById('usersTable').innerHTML = html;
}

async function activateUser(userId) {
    if (!confirm('Are you sure you want to activate this user?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}/activate`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('User activated successfully!');
            loadUsers();
            loadDashboardStats();
        } else {
            alert('Failed to activate user: ' + data.message);
        }
    } catch (error) {
        console.error('Error activating user:', error);
        alert('Error activating user.');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
            loadDashboardStats();
        } else {
            alert('Failed to delete user: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user.');
    }
}

async function loadTutorials() {
    try {
        const response = await fetch('/api/tutorials', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayTutorials(data.tutorials);
        } else {
            document.getElementById('tutorialsList').innerHTML = '<p style="color: red;">Failed to load tutorials.</p>';
        }
    } catch (error) {
        console.error('Error loading tutorials:', error);
        document.getElementById('tutorialsList').innerHTML = '<p style="color: red;">Error loading tutorials.</p>';
    }
}

function displayTutorials(tutorials) {
    if (tutorials.length === 0) {
        document.getElementById('tutorialsList').innerHTML = '<p>No tutorials found.</p>';
        return;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';

    tutorials.forEach(tutorial => {
        html += `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h4>${tutorial.title}</h4>
                <p style="color: #666; margin: 10px 0;">${tutorial.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                    <span style="background: var(--primary-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${tutorial.category}</span>
                    <span style="color: #666; font-size: 0.9rem;">${tutorial.duration} min</span>
                </div>
                <div style="margin-top: 10px;">
                    <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 3px; font-size: 0.8rem;">${tutorial.level}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    document.getElementById('tutorialsList').innerHTML = html;
}

async function loadAnalytics() {
    // For now, just show basic stats
    const analyticsHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h4>User Registration Trend</h4>
                <p style="font-size: 2rem; color: var(--primary-color); margin: 10px 0;">+15%</p>
                <p style="color: #666;">This month</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h4>Activation Rate</h4>
                <p style="font-size: 2rem; color: var(--primary-color); margin: 10px 0;">78%</p>
                <p style="color: #666;">Of registered users</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h4>Average Session</h4>
                <p style="font-size: 2rem; color: var(--primary-color); margin: 10px 0;">45min</p>
                <p style="color: #666;">Per user</p>
            </div>
        </div>
    `;

    document.getElementById('analyticsData').innerHTML = analyticsHtml;
}
