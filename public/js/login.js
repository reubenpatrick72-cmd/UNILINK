// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');

    // Check if already logged in
    if (isLoggedIn()) {
        window.location.href = '../student/dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous alerts
        hideAlert('successAlert');
        hideAlert('errorAlert');

        // Get form data
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;

            // Send login request
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                // Success
                storeToken(result.token);
                storeUser(result.user);
                
                showAlert('success', 'Login successful! Redirecting...', 'successAlert');
                
                // Redirect based on user type
                if (result.user.isAdmin) {
                    redirectTo('../admin/admin-dashboard.html');
                } else if (result.user.isActivated) {
                    redirectTo('../student/dashboard.html');
                } else {
                    redirectTo('../activation/activate.html');
                }
            } else {
                // Error
                showAlert('error', result.message || 'Login failed. Please check your credentials.', 'errorAlert');
            }

        } catch (error) {
            console.error('Login error:', error);
            showAlert('error', 'Network error. Please check your connection and try again.', 'errorAlert');
        } finally {
            // Reset button
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
        }
    });

    // Show password toggle
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('focus', function() {
            // Could add password visibility toggle here
        });
    }
});
