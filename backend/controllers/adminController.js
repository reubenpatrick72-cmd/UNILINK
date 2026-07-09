const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const Progress = require('../models/Progress');

const adminController = {
    // Get all users
    getUsers: async(req, res) => {
        try {
            const users = await User.find().select('-password').sort({ createdAt: -1 });
            res.json({ users });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Get admin statistics
    getStats: async(req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const activatedUsers = await User.countDocuments({ isActivated: true });
            const totalTutorials = await Tutorial.countDocuments();
            const totalProgress = await Progress.countDocuments();

            res.json({
                totalUsers,
                activatedUsers,
                totalTutorials,
                totalProgress
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Create admin user
    createAdmin: async(req, res) => {
        try {
            const { email, password } = req.body;

            // Check if admin already exists
            const existingAdmin = await User.findOne({ email, isAdmin: true });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Admin already exists.' });
            }

            // Hash password
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create admin user
            const admin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email,
                phone: '254700000000',
                university: 'UniLink',
                course: 'Administration',
                year: 1,
                password: hashedPassword,
                isActivated: true,
                isAdmin: true
            });

            await admin.save();
            res.status(201).json({ message: 'Admin created successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Activate user
    activateUser: async(req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id, { isActivated: true, activationDate: new Date() }, { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json({ message: 'User activated successfully.', user });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    },

    // Delete user
    deleteUser: async(req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.json({ message: 'User deleted successfully.' });
        } catch (error) {
            res.status(500).json({ message: 'Server error.' });
        }
    }
};

module.exports = adminController;