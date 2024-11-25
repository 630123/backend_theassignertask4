const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    displayName: { type: String },
    email: { type: String },
    profilePhoto: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
