# OTP Registration System Setup Guide

## Overview
The registration system now includes a Two-Factor OTP (One-Time Password) verification process. After users confirm their password, an OTP is sent to either their email or phone number for verification before account creation.

## Registration Flow

1. **Step 1**: User enters email address
2. **Step 2**: User enters profile details (first name, last name, phone) and password
3. **Step 3**: User selects OTP delivery method (email or SMS) and confirms password
4. **Step 4**: OTP is sent to selected contact method
5. **Step 5**: User enters the 6-digit OTP code
6. **Step 6**: Account is created after OTP verification

## Environment Configuration

Add the following to your `.env` file:

```env
# Email Configuration (for OTP sending via email)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Optional: SMS Configuration (for OTP sending via SMS)
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
# TWILIO_PHONE_NUMBER=your-twilio-phone-number

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
```

## Setting Up Gmail for OTP Emails

### Method 1: Using Gmail App Password (Recommended for Gmail)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Search for **App passwords** in the search bar
5. Select **Mail** and **Windows Computer** (or your OS)
6. Google will generate a 16-character password
7. Copy this password and use it as `EMAIL_PASSWORD` in your `.env` file

### Method 2: Using Your Gmail Password Directly (Less Secure)

1. Allow "Less secure app access" in your Google Account settings
2. Use your regular Gmail password as `EMAIL_PASSWORD`

**Note**: Method 1 is more secure and recommended.

## OTP Features

- **OTP Expiration**: 10 minutes
- **OTP Length**: 6 digits
- **Delivery Methods**: Email and SMS (SMS requires Twilio setup)
- **Resend Option**: Users can resend OTP if they don't receive it
- **Input Validation**: OTP input only accepts numeric characters

## Backend API Endpoints

### 1. Send OTP
**Endpoint**: `POST /api/auth/send-otp`

**Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "254712345678",
  "otpMethod": "email" // or "phone"
}
```

**Response**:
```json
{
  "message": "OTP sent to your email.",
  "target": "user@example.com"
}
```

### 2. Verify OTP
**Endpoint**: `POST /api/auth/verify-otp`

**Request Body**:
```json
{
  "email": "user@example.com",
  "otpCode": "123456",
  "otpMethod": "email"
}
```

**Response**:
```json
{
  "message": "OTP verified successfully. You can now complete your registration.",
  "verified": true
}
```

### 3. Register User
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "phone": "254712345678",
  "password": "secure_password"
}
```

## OTP Storage

Currently, OTPs are stored in memory (`otpStorage` object). For production use with multiple server instances, consider:

1. **Redis**: Fast in-memory data store
2. **MongoDB**: Store OTPs in a temporary collection with TTL index
3. **Memcached**: Distributed memory caching system

Example for moving to Redis:
```javascript
// Store OTP in Redis with 10-minute expiration
await redis.setex(`otp:${email}:${otpMethod}`, 600, JSON.stringify({ otp, phone }));

// Retrieve OTP
const storedOTP = JSON.parse(await redis.get(`otp:${email}:${otpMethod}`));

// Clear OTP
await redis.del(`otp:${email}:${otpMethod}`);
```

## SMS Setup (Optional - Using Twilio)

If you want to enable OTP via SMS:

1. Sign up for Twilio: https://www.twilio.com/
2. Get your Account SID, Auth Token, and a Twilio phone number
3. Add these to your `.env` file
4. Uncomment and implement the Twilio integration in `authController.js`:

```javascript
// Uncomment in sendOTPSMS function
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
await client.messages.create({
    body: `Your UniLink verification code is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
});
```

## Testing

### Test Email Sending
1. Register with a test email
2. Select "Send OTP to Email"
3. Check your email inbox for the OTP
4. Enter the OTP in the form

### Test SMS Sending (if Twilio is configured)
1. Register with a test phone number
2. Select "Send OTP to Phone"
3. Check your phone for the SMS
4. Enter the OTP in the form

## Installation

After making these changes, install the new dependency:

```bash
cd backend
npm install
```

## Frontend Changes

The registration form (`register.html`) now includes:
- Radio buttons to select OTP delivery method (email/phone)
- Input field for OTP verification with numeric validation
- Resend OTP button
- Real-time feedback messages

## Security Considerations

1. **OTP Length**: 6 digits provides reasonable security for most use cases
2. **OTP Expiration**: 10 minutes - balance between usability and security
3. **Rate Limiting**: Consider implementing rate limiting to prevent brute force attacks
4. **HTTPS Only**: Always use HTTPS in production to protect OTP in transit
5. **Never Display OTP**: Don't show the full OTP in alerts (only for development/testing)

## Troubleshooting

### Emails not sending
1. Check that `EMAIL_USER` and `EMAIL_PASSWORD` are correctly set in `.env`
2. Verify Gmail's App Password configuration
3. Check server logs for error messages
4. Ensure less secure app access is enabled (if using Gmail password method)

### OTP expires too quickly
- Adjust `expiresIn` in `sendOTP` function (in milliseconds)

### Users not receiving SMS
1. Verify Twilio credentials
2. Check that phone numbers are in correct format (254XXXXXXXXX)
3. Check Twilio account balance

## Future Enhancements

1. **Rate Limiting**: Limit OTP requests per IP/email
2. **Brute Force Protection**: Lock account after multiple failed attempts
3. **Audit Logging**: Track OTP requests and verifications
4. **Email Templates**: Use HTML email templates for better formatting
5. **Multi-language Support**: Send OTPs in user's preferred language
