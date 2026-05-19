// Payment processing for Mpesa STK
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const loadingDiv = document.getElementById('loadingDiv');

    // Check if user is logged in
    const token = localStorage.getItem('unilink_token');
    if (!token) {
        window.location.href = '../auth/login.html';
        return;
    }

    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous alerts
        hideAlert('successAlert');
        hideAlert('errorAlert');

        // Get form data
        const formData = new FormData(paymentForm);
        const paymentData = {
            phone: formData.get('phone'),
            amount: 150, // Fixed activation fee
            methodName: formData.get('methodName'),
            accountNumber: formData.get('accountNumber')
        };

        // Validate phone number
        if (!validatePhoneNumber(paymentData.phone)) {
            showAlert('error', 'Please enter a valid phone number (254XXXXXXXXX).', 'errorAlert');
            return;
        }

        if (!paymentData.accountNumber || paymentData.accountNumber.trim().length < 4) {
            showAlert('error', 'Please enter a valid Paybill or Till number.', 'errorAlert');
            return;
        }

        try {
            // Show loading state
            showLoading('loadingDiv');
            const submitBtn = paymentForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing Payment...';

            // Send payment request
            const response = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok) {
                // Payment initiated successfully
                showAlert('success', 'STK push sent to your phone. Please enter your Mpesa PIN to complete payment.', 'successAlert');
                
                // Start polling for payment status
                pollPaymentStatus(result.checkoutRequestId);
                
            } else {
                // Error
                hideLoading('loadingDiv');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pay KES 150 with Mpesa';
                showAlert('error', result.message || 'Payment initiation failed. Please try again.', 'errorAlert');
            }

        } catch (error) {
            console.error('Payment error:', error);
            hideLoading('loadingDiv');
            const submitBtn = paymentForm.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Pay KES 150 with Mpesa';
            showAlert('error', 'Network error. Please check your connection and try again.', 'errorAlert');
        }
    });

    // Format phone number as user types
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        this.value = formatPhoneNumber(this.value);
    });
});

async function pollPaymentStatus(checkoutRequestId) {
    const token = localStorage.getItem('unilink_token');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)

    const pollInterval = setInterval(async () => {
        attempts++;

        try {
            const response = await fetch(`/api/payment/status/${checkoutRequestId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'completed') {
                // Payment successful
                clearInterval(pollInterval);
                hideLoading('loadingDiv');
                showAlert('success', 'Payment received! Your account has been activated. Redirecting to dashboard...', 'successAlert');
                redirectTo('../student/dashboard.html');
                return;
            } else if (response.ok && result.status === 'failed') {
                // Payment failed
                clearInterval(pollInterval);
                hideLoading('loadingDiv');
                const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pay KES 150 with Mpesa';
                showAlert('error', 'Payment failed. Please try again or contact support.', 'errorAlert');
                return;
            }

        } catch (error) {
            console.error('Polling error:', error);
        }

        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            hideLoading('loadingDiv');
            const submitBtn = document.querySelector('#paymentForm button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Pay KES 150 with Mpesa';
            showAlert('error', 'Payment timeout. Please check your Mpesa messages and try again if needed.', 'errorAlert');
        }
    }, 5000); // Poll every 5 seconds
}

// Load user data if available
async function loadUserData() {
    const token = localStorage.getItem('unilink_token');
    if (!token) return;

    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            // Pre-fill phone number if available
            if (result.user && result.user.phone) {
                document.getElementById('phone').value = result.user.phone;
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load user data on page load
loadUserData();
