// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema for User
const userSchema = new Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  profilePic: { type: String }
});

// Create User Model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
