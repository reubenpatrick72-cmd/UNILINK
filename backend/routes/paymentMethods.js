const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

// Authentication middleware
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

router.post('/', auth, paymentMethodController.addMethod);
router.get('/', auth, paymentMethodController.listMethods);
router.put('/:id', auth, paymentMethodController.updateMethod);
router.delete('/:id', auth, paymentMethodController.deleteMethod);

module.exports = router;
