const Purchase = require('../models/Purchase');
const Note = require('../models/Note');
const User = require('../models/User');

// Purchase a note
exports.purchaseNote = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { noteId, transactionId, paymentMethod } = req.body;
    
    // Verify user has paid activation fee
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'Please pay activation fee first' });
    }
    
    // Get note details
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      buyerId: req.user.id,
      noteId: noteId
    });
    
    if (existingPurchase && existingPurchase.isPurchased) {
      return res.status(400).json({ success: false, message: 'You have already purchased this note' });
    }
    
    // Create purchase record
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days access
    
    const purchase = new Purchase({
      buyerId: req.user.id,
      buyerName: user.username || user.email,
      noteId: note._id,
      noteTitle: note.title,
      sellerId: note.sellerId,
      sellerName: note.sellerName,
      amount: note.price,
      transactionId,
      paymentMethod,
      paymentStatus: 'completed',
      expiryDate,
      isPurchased: true
    });
    
    await purchase.save();
    
    // Update note download count
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });
    
    res.status(201).json({
      success: true,
      message: 'Purchase successful',
      data: purchase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download note (check access and permissions)
exports.downloadNote = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { purchaseId } = req.params;
    
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    
    // Verify ownership
    if (purchase.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }
    
    // Check if access expired
    if (new Date() > purchase.expiryDate) {
      return res.status(403).json({ success: false, message: 'Access expired. Please purchase again.' });
    }
    
    // Check download limit
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(403).json({ success: false, message: 'Download limit exceeded' });
    }
    
    // Get note content
    const note = await Note.findById(purchase.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    
    // Update download count
    await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        $inc: { downloadCount: 1 },
        lastDownloadDate: new Date()
      }
    );
    
    res.json({
      success: true,
      data: {
        title: note.title,
        content: note.fullContent,
        fileType: note.fileType,
        downloadCount: purchase.downloadCount + 1,
        maxDownloads: purchase.maxDownloads,
        expiryDate: purchase.expiryDate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's purchases
exports.getUserPurchases = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    const total = await Purchase.countDocuments({
      buyerId: req.user.id,
      isPurchased: true
    });
    
    const purchases = await Purchase.find({
      buyerId: req.user.id,
      isPurchased: true
    })
      .populate('noteId', 'title course unit price')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: purchases,
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

// Get seller's sales
exports.getSellerSales = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    const total = await Purchase.countDocuments({
      sellerId: req.user.id
    });
    
    const sales = await Purchase.find({
      sellerId: req.user.id
    })
      .populate('noteId', 'title course unit')
      .populate('buyerId', 'username email')
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: sales,
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
