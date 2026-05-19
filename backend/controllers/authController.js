const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Simple in-memory OTP storage (in production, use Redis or database)
const otpStorage = {};

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'UniLink - Your OTP Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p style="color: #666; font-size: 16px;">Welcome to UniLink! Use the code below to complete your registration:</p>
                    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #007bff; letter-spacing: 2px; margin: 0;">${otp}</h1>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't sign up for UniLink, please ignore this email.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Function to send OTP via SMS (using a placeholder)
const sendOTPSMS = async (phone, otp) => {
    // In production, integrate with Twilio, Nexmo, or similar SMS provider
    console.log(`SMS OTP sent to ${phone}: ${otp}`);
    
    // Placeholder for SMS sending
    // Example using Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: `Your UniLink verification code is: ${otp}`,
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: phone
    // });
    
    return true;
};

const authController = {
    // Register new user
    register: async(req, res) => {
        try {
            const { firstName, lastName, email, phone, password } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !phone || !password) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format.' });
            }

            // Validate phone format
            const phoneRegex = /^254[0-9]{9}$/;
            if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
                return res.status(400).json({ message: 'Invalid phone number format. Use 254XXXXXXXXX.' });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters.' });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email.' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = new User({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword
            });

            await user.save();

            res.status(201).json({ message: 'User registered successfully.' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Registration failed: ' + error.message });
        }
    },

    // Login user
    login: async(req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            // Check password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            // Create token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production', { expiresIn: '7d' });

            res.json({
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isActivated: user.isActivated,
                    isAdmin: user.isAdmin
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    },

    // Get current user profile
    getProfile: async(req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json({ user });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Top up account balance
    topUpBalance: async(req, res) => {
        try {
            const { amount } = req.body;

            if (!amount || amount < 100) {
                return res.status(400).json({ message: 'Minimum top-up amount is KES 100.' });
            }

            // Get user
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            // In a real app, payment processing would happen here
            // For demo purposes, we'll just add the amount to balance
            user.balance = (user.balance || 0) + amount;
            await user.save();

            res.json({
                message: `Successfully added $${amount} to your account balance.`,
                newBalance: user.balance
            });
        } catch (error) {
            console.error('Balance top-up error:', error);
            res.status(500).json({ message: 'Error processing top-up: ' + error.message });
        }
    },

    // Send OTP for registration
    sendOTP: async(req, res) => {
        try {
            const { email, phone, otpMethod } = req.body;

            // Validate required fields
            if (!email || !phone || !otpMethod) {
                return res.status(400).json({ message: 'Email, phone, and OTP method are required.' });
            }

            // Validate OTP method
            if (otpMethod !== 'email' && otpMethod !== 'phone') {
                return res.status(400).json({ message: 'OTP method must be either email or phone.' });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'This email is already registered.' });
            }

            // Generate OTP
            const otp = generateOTP();
            
            // Store OTP with expiration (10 minutes)
            const key = `${email}:${otpMethod}`;
            otpStorage[key] = {
                otp,
                timestamp: Date.now(),
                phone,
                expiresIn: 600000 // 10 minutes
            };

            // Send OTP
            let sent = false;
            if (otpMethod === 'email') {
                sent = await sendOTPEmail(email, otp);
            } else if (otpMethod === 'phone') {
                sent = await sendOTPSMS(phone, otp);
            }

            if (!sent) {
                return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
            }

            res.json({ 
                message: `OTP sent to your ${otpMethod}.`,
                target: otpMethod === 'email' ? email : `${phone.slice(0, -4)}****`
            });
        } catch (error) {
            console.error('OTP sending error:', error);
            res.status(500).json({ message: 'Error sending OTP: ' + error.message });
        }
    },

    // Verify OTP
    verifyOTP: async(req, res) => {
        try {
            const { email, otpCode, otpMethod } = req.body;

            // Validate required fields
            if (!email || !otpCode || !otpMethod) {
                return res.status(400).json({ message: 'Email, OTP code, and OTP method are required.' });
            }

            const key = `${email}:${otpMethod}`;
            const storedOTP = otpStorage[key];

            // Check if OTP exists
            if (!storedOTP) {
                return res.status(400).json({ message: 'OTP not found or expired. Please request a new OTP.' });
            }

            // Check if OTP has expired
            if (Date.now() - storedOTP.timestamp > storedOTP.expiresIn) {
                delete otpStorage[key];
                return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
            }

            // Verify OTP
            if (storedOTP.otp !== otpCode) {
                return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
            }

            // OTP verified successfully, clear it
            delete otpStorage[key];

            res.json({ 
                message: 'OTP verified successfully. You can now complete your registration.',
                verified: true
            });
        } catch (error) {
            console.error('OTP verification error:', error);
            res.status(500).json({ message: 'Error verifying OTP: ' + error.message });
        }
    }
};

module.exports = authController;