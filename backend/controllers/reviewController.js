const Review = require('../models/Review');
const Purchase = require('../models/Purchase');
const Note = require('../models/Note');
const User = require('../models/User');

// Create review
exports.createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { purchaseId, noteId, rating, title, comment, aspects } = req.body;
    
    // Verify purchase exists and belongs to user
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase || purchase.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Invalid purchase' });
    }
    
    if (purchase.hasReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this note' });
    }
    
    // Get user info
    const user = await User.findById(req.user.id);
    
    const review = new Review({
      purchaseId,
      noteId,
      reviewerId: req.user.id,
      reviewerName: user.username || user.email,
      sellerId: purchase.sellerId,
      rating,
      title,
      comment,
      aspects: {
        accuracy: aspects.accuracy || rating,
        completeness: aspects.completeness || rating,
        clarity: aspects.clarity || rating,
        relevance: aspects.relevance || rating
      },
      isVerifiedPurchase: true
    });
    
    await review.save();
    
    // Update purchase record
    await Purchase.findByIdAndUpdate(purchaseId, {
      hasReviewed: true,
      reviewId: review._id
    });
    
    // Update note's average rating
    const allReviews = await Review.find({ noteId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await Note.findByIdAndUpdate(noteId, {
      averageRating,
      totalReviews: allReviews.length,
      sellerRating: averageRating
    });
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a note
exports.getNotesReviews = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { page = 1, limit = 10, sort = 'helpful' } = req.query;
    
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments({
      noteId,
      status: 'approved'
    });
    
    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') {
      sortOption = { helpful: -1 };
    } else if (sort === 'rating-high') {
      sortOption = { rating: -1 };
    } else if (sort === 'rating-low') {
      sortOption = { rating: 1 };
    }
    
    const reviews = await Review.find({
      noteId,
      status: 'approved'
    })
      .populate('reviewerId', 'username')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Marked as helpful',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as unhelpful
exports.markUnhelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { unhelpful: 1 } },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Marked as unhelpful',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Seller responds to review
exports.respondToReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { reviewId } = req.params;
    const { comment } = req.body;
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Verify seller
    if (review.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    review.sellerResponse = {
      comment,
      respondedAt: new Date()
    };
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get seller's reviews
exports.getSellerReviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    const total = await Review.countDocuments({
      sellerId: req.user.id
    });
    
    const reviews = await Review.find({
      sellerId: req.user.id
    })
      .populate('noteId', 'title')
      .populate('reviewerId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
