const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');

// Purchase a note (requires authentication)
router.post('/buy', authenticate, purchaseController.purchaseNote);

// Download note (requires authentication)
router.get('/download/:purchaseId', authenticate, purchaseController.downloadNote);

// Get user's purchases (requires authentication)
router.get('/my-purchases', authenticate, purchaseController.getUserPurchases);

// Get seller's sales (requires authentication)
router.get('/my-sales', authenticate, purchaseController.getSellerSales);

module.exports = router;
