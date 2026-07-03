const Note = require('../models/Note');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

// Get all notes with filters
exports.getAllNotes = async (req, res) => {
  try {
    const { course, unit, search, category, sort, page = 1, limit = 10 } = req.query;
    
    let filter = { isActive: true };
    
    if (course) filter.course = course;
    if (unit) filter.unit = unit;
    if (category) filter.category = category;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let query = Note.find(filter);
    
    // Sorting
    if (sort === 'rating') {
      query = query.sort({ averageRating: -1 });
    } else if (sort === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sort === 'downloads') {
      query = query.sort({ downloads: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    const total = await Note.countDocuments(filter);
    const notes = await query.skip(skip).limit(parseInt(limit));
    
    res.json({
      success: true,
      data: notes,
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

// Get note by ID with sample content
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Check if user has purchased this note
    let hasFullAccess = false;
    if (req.user) {
      const purchase = await Purchase.findOne({
        buyerId: req.user.id,
        noteId: note._id,
        isPurchased: true
      });
      hasFullAccess = !!purchase;
    }
    
    // Return sample content for non-buyers
    const responseNote = note.toObject();
    if (!hasFullAccess) {
      responseNote.fullContent = null; // Don't send full content
    }
    
    res.json({ success: true, data: responseNote, hasFullAccess });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload new note (seller)
exports.uploadNote = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { title, description, course, unit, university, category, sampleContent, fullContent, fileType } = req.body;
    
    // Verify user has paid activation fee
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'Account not activated. Please pay activation fee.' });
    }
    
    const note = new Note({
      title,
      description,
      course,
      unit,
      university,
      category,
      sampleContent,
      fullContent,
      fileType,
      sellerId: req.user.id,
      sellerName: user.username || user.email,
      price: 50
    });
    
    await note.save();
    
    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get seller notes (authenticated seller view)
exports.getSellerNotes = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { page = 1, limit = 10, status = 'active' } = req.query;
    const filter = { sellerId: req.user.id };
    if (status === 'inactive') filter.isActive = false;
    else filter.isActive = true;

    const skip = (page - 1) * limit;
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    res.json({
      success: true,
      data: notes,
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

// Get seller dashboard stats
exports.getSellerDashboard = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const sellerId = req.user.id;
    const notesCount = await Note.countDocuments({ sellerId, isActive: true });
    const salesCount = await Purchase.countDocuments({ sellerId, paymentStatus: 'completed' });
    const totalRevenueResult = await Purchase.aggregate([
      { $match: { sellerId: require('mongoose').Types.ObjectId(sellerId), paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDownloadsResult = await Note.aggregate([
      { $match: { sellerId: require('mongoose').Types.ObjectId(sellerId) } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const avgRatingResult = await Note.aggregate([
      { $match: { sellerId: require('mongoose').Types.ObjectId(sellerId), averageRating: { $gt: 0 } } },
      { $group: { _id: null, averageRating: { $avg: '$averageRating' } } }
    ]);

    res.json({
      success: true,
      data: {
        notesCount,
        salesCount,
        totalRevenue: totalRevenueResult[0]?.total || 0,
        totalDownloads: totalDownloadsResult[0]?.total || 0,
        averageRating: avgRatingResult[0]?.averageRating ? Number(avgRatingResult[0].averageRating.toFixed(1)) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update seller note
exports.updateNote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updates = req.body;
    const allowedFields = ['title', 'description', 'course', 'unit', 'university', 'category', 'sampleContent', 'fullContent', 'fileType', 'price', 'isActive'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) note[field] = updates[field];
    });
    note.updatedAt = new Date();
    await note.save();

    res.json({ success: true, message: 'Note updated successfully', data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete seller note (soft delete)
exports.deleteNote = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    note.isActive = false;
    await note.save();

    res.json({ success: true, message: 'Note removed from marketplace' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Note.distinct('course');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get units by course
exports.getUnitsByCourse = async (req, res) => {
  try {
    const { course } = req.params;
    const units = await Note.distinct('unit', { course });
    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get seller info and ratings
exports.getSellerInfo = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const seller = await User.findById(sellerId).select('-password');
    const notesCount = await Note.countDocuments({ sellerId, isActive: true });
    const totalDownloads = await Note.aggregate([
      { $match: { sellerId: require('mongoose').Types.ObjectId(sellerId) } },
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        seller,
        notesCount,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
