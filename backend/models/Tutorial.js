const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    duration: Number,
    level: String,
    content: String,
    videos: [{
        title: String,
        url: String,
        duration: String,
        description: String
    }],
    templates: [{
        name: String,
        description: String,
        type: { type: String, enum: ['free', 'premium'], default: 'free' },
        price: { type: Number, default: 0 },
        features: [String],
        downloadUrl: String,
        previewUrl: String
    }],
    isPremium: { type: Boolean, default: false },
    premiumPrice: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tutorial', tutorialSchema);