const User = require('../models/User');
const Tutorial = require('../models/Tutorial');
const Progress = require('../models/Progress');
const Note = require('../models/Note');
const Purchase = require('../models/Purchase');
const Review = require('../models/Review');

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
    },

    // Get platform analytics
    getAnalytics: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const activeSellers = await User.countDocuments({ isActive: true });
            const totalNotes = await Note.countDocuments({ isActive: true });
            const totalSales = await Purchase.countDocuments({ paymentStatus: 'completed' });
            const revenueResult = await Purchase.aggregate([
                { $match: { paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalDownloads = await Note.aggregate([
                { $group: { _id: null, total: { $sum: '$downloads' } } }
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    activeSellers,
                    totalNotes,
                    totalSales,
                    totalRevenue: revenueResult[0]?.total || 0,
                    totalDownloads: totalDownloads[0]?.total || 0
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get all notes for moderation
    getNotes: async (req, res) => {
        try {
            const { status = 'all', page = 1, limit = 20 } = req.query;
            let filter = {};
            if (status !== 'all') filter.isActive = status === 'active';

            const skip = (page - 1) * limit;
            const total = await Note.countDocuments(filter);
            const notes = await Note.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('sellerId', 'username email');

            res.json({
                success: true,
                data: notes,
                pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Approve/Reject note
    updateNoteStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const note = await Note.findByIdAndUpdate(id, { isActive }, { new: true });

            if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

            res.json({
                success: true,
                message: isActive ? 'Note approved' : 'Note rejected',
                data: note
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get all reviews for moderation
    getReviews: async (req, res) => {
        try {
            const { status = 'all', page = 1, limit = 20 } = req.query;
            let filter = {};
            if (status !== 'all') filter.status = status;

            const skip = (page - 1) * limit;
            const total = await Review.countDocuments(filter);
            const reviews = await Review.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('reviewerId', 'username')
                .populate('noteId', 'title');

            res.json({
                success: true,
                data: reviews,
                pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Approve/Reject review
    updateReviewStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const review = await Review.findByIdAndUpdate(id, { status }, { new: true });

            if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

            res.json({ success: true, message: `Review ${status}`, data: review });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get transactions
    getTransactions: async (req, res) => {
        try {
            const { status = 'all', page = 1, limit = 20 } = req.query;
            let filter = {};
            if (status !== 'all') filter.paymentStatus = status;

            const skip = (page - 1) * limit;
            const total = await Purchase.countDocuments(filter);
            const purchases = await Purchase.find(filter)
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('buyerId', 'username email')
                .populate('sellerId', 'username email')
                .populate('noteId', 'title');

            res.json({
                success: true,
                data: purchases,
                pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Get seller details
    getSellers: async (req, res) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;
            
            const total = await User.countDocuments({ isActive: true });
            const sellers = await User.find({ isActive: true })
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            // Get notes and sales for each seller
            const sellersWithStats = await Promise.all(
                sellers.map(async (seller) => {
                    const notesCount = await Note.countDocuments({ sellerId: seller._id, isActive: true });
                    const salesCount = await Purchase.countDocuments({ sellerId: seller._id, paymentStatus: 'completed' });
                    return {
                        ...seller.toObject(),
                        notesCount,
                        salesCount
                    };
                })
            );

            res.json({
                success: true,
                data: sellersWithStats,
                pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Verify/Suspend user
    updateUserStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');

            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            res.json({
                success: true,
                message: isActive ? 'User verified' : 'User suspended',
                data: user
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = adminController;