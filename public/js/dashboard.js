// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '../auth/login.html';
        return;
    }

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
    loadUserProfile();
    loadTutorials();
    loadProgress();

    // Top-up functionality
    const topUpBtn = document.getElementById('topUpBtn');
    if (topUpBtn) {
        topUpBtn.addEventListener('click', openTopUpModal);
    }

    // Amount selection
    const amountBtns = document.querySelectorAll('.amount-btn');
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            amountBtns.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            // Clear custom amount
            document.getElementById('customAmount').value = '';
        });
    });
});

function initializeDashboard() {
    const user = getUser();
    if (user) {
        document.getElementById('userName').innerHTML = `Welcome, <strong>${user.firstName}</strong>`;
        document.getElementById('sidebarName').textContent = `${user.firstName} ${user.lastName}`;
    }
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

async function loadUserProfile() {
    try {
        const response = await apiRequest('/api/auth/me');
        if (response.user) {
            // Update profile information
            document.getElementById('profileFirstName').textContent = response.user.firstName;
            document.getElementById('profileLastName').textContent = response.user.lastName;
            document.getElementById('profileEmail').textContent = response.user.email;
            document.getElementById('profilePhone').textContent = response.user.phone;
            document.getElementById('profileUniversity').textContent = response.user.university;
            document.getElementById('profileCourse').textContent = response.user.course;
            document.getElementById('profileYear').textContent = response.user.year;

            const activationStatus = response.user.isActivated ? 'Activated' : 'Pending Activation';
            const statusColor = response.user.isActivated ? 'var(--success-color)' : 'var(--warning-color)';
            document.getElementById('profileStatus').innerHTML = `<span style="color: ${statusColor};">${activationStatus}</span>`;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

async function loadTutorials() {
    try {
        const response = await apiRequest('/api/tutorials');
        if (response.tutorials) {
            displayTutorials(response.tutorials);
        }
    } catch (error) {
        console.error('Error loading tutorials:', error);
        // Show message if user is not activated
        if (error.message && error.message.includes('activated')) {
            showActivationMessage();
        }
    }
}

function displayTutorials(tutorials) {
    const tutorialsGrid = document.getElementById('tutorialsGrid');
    if (!tutorialsGrid) return;

    tutorialsGrid.innerHTML = '';

    tutorials.forEach(tutorial => {
        const tutorialCard = createTutorialCard(tutorial);
        tutorialsGrid.appendChild(tutorialCard);
    });
}

function createTutorialCard(tutorial) {
    const card = document.createElement('div');
    card.className = 'tutorial-card';
    card.innerHTML = `
        <div class="tutorial-header">
            <h3>${tutorial.title}</h3>
            <span class="tutorial-level ${tutorial.level.toLowerCase()}">${tutorial.level}</span>
        </div>
        <p class="tutorial-description">${tutorial.description}</p>
        <div class="tutorial-meta">
            <span><i class="fas fa-clock"></i> ${tutorial.duration} min</span>
            <span><i class="fas fa-tag"></i> ${tutorial.category}</span>
        </div>
        <div class="tutorial-actions">
            <button class="btn btn-primary" onclick="viewTutorial('${tutorial._id}')">
                <i class="fas fa-play"></i> Start Learning
            </button>
        </div>
    `;

    return card;
}

function viewTutorial(tutorialId) {
    // For now, redirect to a tutorial detail page
    // In a real app, this would open a modal or navigate to tutorial content
    window.location.href = `tutorial.html?id=${tutorialId}`;
}

async function loadProgress() {
    try {
        // This would load user progress from the API
        // For now, show placeholder data
        updateProgressDisplay(0, 0);
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function updateProgressDisplay(completed, total) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;
    document.getElementById('progressBar').style.width = `${percentage}%`;
}

function showActivationMessage() {
    const tutorialsGrid = document.getElementById('tutorialsGrid');
    if (tutorialsGrid) {
        tutorialsGrid.innerHTML = `
            <div class="user-card" style="text-align: center; padding: 40px;">
                <i class="fas fa-lock" style="font-size: 3rem; color: var(--warning-color); margin-bottom: 20px;"></i>
                <h3 style="color: var(--warning-color); margin-bottom: 15px;">Account Not Activated</h3>
                <p style="margin-bottom: 25px;">You need to activate your account to access the tutorials. Complete the payment process to unlock all learning materials.</p>
                <button class="btn btn-primary" onclick="window.location.href='../activation/activate.html'">
                    <i class="fas fa-credit-card"></i> Activate Account
                </button>
            </div>
        `;
    }
}

// Balance and Top-up Functions
function openTopUpModal() {
    document.getElementById('topUpModal').style.display = 'block';
}

function closeTopUpModal() {
    document.getElementById('topUpModal').style.display = 'none';
    // Reset form
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('customAmount').value = '';
}

async function proceedToPayment() {
    let amount = 0;
    
    // Check selected amount button
    const selectedBtn = document.querySelector('.amount-btn.selected');
    if (selectedBtn) {
        amount = parseInt(selectedBtn.getAttribute('data-amount'));
    } else {
        // Check custom amount
        const customAmount = document.getElementById('customAmount').value;
        if (customAmount && customAmount >= 100) {
            amount = parseInt(customAmount);
        }
    }
    
    if (amount < 100) {
        alert('Please select an amount of at least KES 100.');
        return;
    }
    
    try {
        // Call backend API to top up balance
        const response = await apiRequest('/api/auth/topup', 'POST', { amount });
        
        if (response.message) {
            alert(response.message);
            // Update balance display
            document.getElementById('accountBalance').textContent = `KES ${response.newBalance.toFixed(2)}`;
            closeTopUpModal();
        }
    } catch (error) {
        console.error('Top-up error:', error);
        alert('Error processing top-up. Please try again.');
    }
}

async function updateBalance(amount) {
    try {
        // In a real app, this would be handled by the payment gateway callback
        // For demo purposes, we'll update the balance locally
        const user = getUser();
        if (user) {
            user.balance = (user.balance || 0) + amount;
            localStorage.setItem('user', JSON.stringify(user));
            document.getElementById('accountBalance').textContent = `$${user.balance.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

// Update loadUserProfile to include balance
async function loadUserProfile() {
    try {
        const response = await apiRequest('/api/auth/me');
        if (response.user) {
            // Update profile information
            document.getElementById('profileFirstName').textContent = response.user.firstName;
            document.getElementById('profileLastName').textContent = response.user.lastName;
            document.getElementById('profileEmail').textContent = response.user.email;
            document.getElementById('profilePhone').textContent = response.user.phone;
            document.getElementById('profileUniversity').textContent = response.user.university || 'Not specified';
            document.getElementById('profileCourse').textContent = response.user.course || 'Not specified';
            document.getElementById('profileYear').textContent = response.user.year || 'Not specified';

            // Update balance display
            const balance = response.user.balance || 0;
            document.getElementById('accountBalance').textContent = `$${balance.toFixed(2)}`;

            const activationStatus = response.user.isActivated ? 'Activated' : 'Pending Activation';
            const statusColor = response.user.isActivated ? 'var(--success-color)' : 'var(--warning-color)';
            document.getElementById('profileStatus').innerHTML = `<span style="color: ${statusColor};">${activationStatus}</span>`;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to local storage for demo
        const user = getUser();
        if (user) {
            document.getElementById('accountBalance').textContent = `$${(user.balance || 0).toFixed(2)}`;
        }
    }
}