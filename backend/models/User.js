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
    isActivated: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    balance: { type: Number, default: 0 },
    activationDate: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);