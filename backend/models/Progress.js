const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tutorialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' },
    completedSteps: { type: Number, default: 0 },
    totalSteps: Number,
    timeSpent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastAccessed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);