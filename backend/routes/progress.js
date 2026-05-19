const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'your-secret-key-change-this-in-production');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Routes
router.get('/', auth, progressController.getProgress);
router.get('/stats', auth, progressController.getProgressStats);
router.get('/:tutorialId', auth, progressController.getTutorialProgress);
router.post('/update', auth, progressController.updateProgress);

module.exports = router;