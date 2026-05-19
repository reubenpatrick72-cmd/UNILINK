// Shared utility functions for the application

// Show alert message
function showAlert(type, message, elementId) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        // Auto-hide after 5 seconds for success alerts
        if (type === 'success') {
            setTimeout(() => {
                hideAlert(elementId);
            }, 5000);
        }
    }
}

// Hide alert message
function hideAlert(elementId) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
        alertElement.style.display = 'none';
    }
}

// Validate phone number format (Kenya format)
function validatePhoneNumber(phone) {
    // Accept format: 254XXXXXXXXX (12 digits starting with 254)
    const phoneRegex = /^254[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Format phone number as user types
function formatPhoneNumber(value) {
    // Remove non-numeric characters
    value = value.replace(/\D/g, '');
    
    // Ensure it starts with 254
    if (!value.startsWith('254') && value.length > 0) {
        if (value.startsWith('0')) {
            value = '254' + value.substring(1);
        } else if (!value.startsWith('254')) {
            value = '254' + value;
        }
    }
    
    // Limit to 12 digits (254XXXXXXXXX)
    if (value.length > 12) {
        value = value.substring(0, 12);
    }
    
    return value;
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        showAlert('error', 'Password must be at least 6 characters long.', 'errorAlert');
        return false;
    }
    return true;
}

// Redirect to another page
function redirectTo(page) {
    setTimeout(() => {
        window.location.href = page;
    }, 2000);
}

// Show loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

// Hide loading indicator
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Store token in localStorage
function storeToken(token) {
    localStorage.setItem('unilink_token', token);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('unilink_token');
}

// Store user data in localStorage
function storeUser(user) {
    localStorage.setItem('unilink_user', JSON.stringify(user));
}

// Get user data from localStorage
function getUser() {
    const userData = localStorage.getItem('unilink_user');
    return userData ? JSON.parse(userData) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return getToken() !== null && getToken() !== 'null' && getToken() !== '';
}

// Check if user is admin
function isAdmin() {
    const user = getUser();
    return user && user.isAdmin === true;
}

// Logout user
function logout() {
    localStorage.removeItem('unilink_token');
    localStorage.removeItem('unilink_user');
    window.location.href = '../../index.html';
}

// API request helper with authentication
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    return response.json();
}
