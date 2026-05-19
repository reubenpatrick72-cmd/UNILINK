// Registration form handling

document.addEventListener('DOMContentLoaded', function() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const otpInfo = document.getElementById('otpInfo');

    const continueEmailBtn = document.getElementById('continueEmailBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const continueProfileBtn = document.getElementById('continueProfileBtn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const backToStep3Btn = document.getElementById('backToStep3Btn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');

    let registrationData = {
        email: '',
        accountType: 'email',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        confirmPassword: '',
        otpMethod: 'email'
    };

    continueEmailBtn.addEventListener('click', function() {
        const emailValue = document.getElementById('email').value.trim();
        if (!emailValue || !validateEmail(emailValue)) {
            showAlert('error', 'Please enter a valid email address.', 'errorAlert');
            return;
        }

        registrationData.email = emailValue;
        registrationData.accountType = 'email';
        hideAlert('successAlert');
        hideAlert('errorAlert');
        showStep(step2);
    });

    googleSignUpBtn.addEventListener('click', function() {
        const emailValue = document.getElementById('email').value.trim();
        if (!emailValue || !validateEmail(emailValue)) {
            showAlert('error', 'Please enter your Google email address first.', 'errorAlert');
            return;
        }

        registrationData.email = emailValue;
        registrationData.accountType = 'google';
        hideAlert('successAlert');
        hideAlert('errorAlert');
        showStep(step2);
        showAlert('success', 'Google sign-up selected. Complete the profile details below.', 'successAlert');
    });

    backToStep1Btn.addEventListener('click', function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');
        showStep(step1);
    });

    continueProfileBtn.addEventListener('click', function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');

        const profileData = collectProfileData();
        if (!validateProfileData(profileData)) {
            return;
        }

        registrationData = { ...registrationData, ...profileData };
        
        // Display email and phone in step 3
        document.getElementById('emailDisplay').textContent = registrationData.email;
        document.getElementById('phoneDisplay').textContent = registrationData.phone;
        
        showStep(step3);
    });

    backToStep2Btn.addEventListener('click', function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');
        showStep(step2);
    });

    sendOtpBtn.addEventListener('click', function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');

        registrationData.otpMethod = document.querySelector('input[name="otpMethod"]:checked').value;
        sendOtp();
    });

    backToStep3Btn.addEventListener('click', function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');
        showStep(step3);
    });

    verifyOtpBtn.addEventListener('click', async function() {
        hideAlert('successAlert');
        hideAlert('errorAlert');

        const otpCode = document.getElementById('otpCode').value.trim();
        if (!otpCode || otpCode.length !== 6) {
            showAlert('error', 'Please enter a valid 6-digit verification code.', 'errorAlert');
            return;
        }

        // Verify OTP with backend
        try {
            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = 'Verifying...';

            const verifyResponse = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: registrationData.email,
                    otpCode: otpCode,
                    otpMethod: registrationData.otpMethod
                })
            });
            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                showAlert('error', verifyData.message || 'Verification code is incorrect.', 'errorAlert');
                return;
            }

            // OTP verified, now submit registration
            await submitRegistration();
        } catch (error) {
            console.error('OTP verification error:', error);
            showAlert('error', 'Error verifying code. Please try again.', 'errorAlert');
        } finally {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Verify & Create Account';
        }
    });

    resendOtpBtn.addEventListener('click', function() {
        sendOtp(true);
    });

    document.getElementById('phone').addEventListener('input', function() {
        this.value = formatPhoneNumber(this.value);
    });

    document.getElementById('password').addEventListener('input', function() {
        validatePassword(this.value);
    });

    document.getElementById('confirmPassword').addEventListener('input', function() {
        validatePasswordMatch(document.getElementById('password').value, this.value);
    });

    // OTP input validation - only allow numbers
    document.getElementById('otpCode').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '').substring(0, 6);
    });

    function showStep(step) {
        step1.style.display = 'none';
        step2.style.display = 'none';
        step3.style.display = 'none';
        step4.style.display = 'none';
        step.style.display = 'block';
    }

    function collectProfileData() {
        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };
    }

    function validateProfileData(data) {
        const requiredFields = ['firstName', 'lastName', 'phone', 'password', 'confirmPassword'];
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                showAlert('error', 'Please complete all profile fields before continuing.', 'errorAlert');
                return false;
            }
        }

        if (data.password !== data.confirmPassword) {
            showAlert('error', 'Passwords do not match.', 'errorAlert');
            return false;
        }

        if (!validatePassword(data.password)) {
            showAlert('error', 'Password must be at least 6 characters.', 'errorAlert');
            return false;
        }

        if (!validatePhoneNumber(data.phone)) {
            showAlert('error', 'Please enter a valid phone number (254XXXXXXXXX).', 'errorAlert');
            return false;
        }

        return true;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function sendOtp(isResend = false) {
        const currentBtn = isResend ? resendOtpBtn : sendOtpBtn;
        const buttonText = isResend ? 'Resending Code...' : 'Sending Code...';
        const finishText = isResend ? 'Resend Code' : 'Send Verification Code';
        
        if (currentBtn) {
            currentBtn.disabled = true;
            currentBtn.textContent = buttonText;
        }

        // Send OTP to backend
        fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registrationData.email,
                phone: registrationData.phone,
                otpMethod: registrationData.otpMethod
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.message) {
                throw new Error('No response from server');
            }
            
            showAlert('success', `${data.message}`, 'successAlert');
            otpInfo.textContent = `We sent a verification code to ${data.target}. It will expire in 10 minutes.`;
            
            // Clear OTP input
            const otpInput = document.getElementById('otpCode');
            if (otpInput) otpInput.value = '';

            // Move to step 4 only if not resending
            if (!isResend) {
                showStep(step4);
            }
        })
        .catch(error => {
            console.error('OTP sending error:', error);
            showAlert('error', error.message || 'Failed to send verification code. Please try again.', 'errorAlert');
        })
        .finally(() => {
            if (currentBtn) {
                currentBtn.disabled = false;
                currentBtn.textContent = finishText;
            }
        });
    }

    async function submitRegistration() {
        const payload = {
            firstName: registrationData.firstName,
            lastName: registrationData.lastName,
            email: registrationData.email,
            phone: registrationData.phone,
            password: registrationData.password
        };

        try {
            verifyOtpBtn.disabled = true;
            verifyOtpBtn.textContent = 'Creating Account...';

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (response.ok) {
                showAlert('success', 'Account created successfully! Redirecting to login...', 'successAlert');
                redirectTo('login.html');
            } else {
                showAlert('error', result.message || 'Registration failed. Please try again.', 'errorAlert');
                showStep(step2);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('error', 'Network error. Please check your connection and try again.', 'errorAlert');
            showStep(step2);
        } finally {
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = 'Verify & Create Account';
        }
    }
});
