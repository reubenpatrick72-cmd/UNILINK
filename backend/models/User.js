const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    university: String,
    course: String,
    year: Number,
    password: String,
    username: { type: String, unique: true, sparse: true },
    bio: { type: String, default: '' },
    sellerRating: { type: Number, default: 0, min: 0, max: 5 },
    isActivated: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }, // For marketplace access
    isAdmin: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    activationDate: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);