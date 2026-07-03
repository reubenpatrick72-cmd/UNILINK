const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  price: {
    type: Number,
    required: true,
    default: 50
  },
  category: {
    type: String,
    enum: ['lecture_notes', 'past_papers', 'revision_guide', 'summary'],
    required: true
  },
  sampleContent: {
    type: String, // Base64 encoded or text preview
    required: true
  },
  fullContent: {
    type: String, // Base64 encoded or file path
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'jpg', 'png'],
    required: true
  },
  fileSize: {
    type: Number // in bytes
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster searches
noteSchema.index({ course: 1, unit: 1 });
noteSchema.index({ title: 'text', description: 'text' });
noteSchema.index({ sellerId: 1 });
noteSchema.index({ isActive: 1 });

module.exports = mongoose.model('Note', noteSchema);
