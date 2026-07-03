const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Create review (requires authentication)
router.post('/create', authenticate, reviewController.createReview);

// Get reviews for a note
router.get('/note/:noteId', reviewController.getNotesReviews);

// Mark review as helpful
router.post('/:reviewId/helpful', reviewController.markHelpful);

// Mark review as unhelpful
router.post('/:reviewId/unhelpful', reviewController.markUnhelpful);

// Seller responds to review (requires authentication)
router.post('/:reviewId/respond', authenticate, reviewController.respondToReview);

// Get seller's reviews (requires authentication)
router.get('/seller/my-reviews', authenticate, reviewController.getSellerReviews);

module.exports = router;
