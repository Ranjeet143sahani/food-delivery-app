const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  address: String,
  restaurant: String,
  category: {
    type: String,
    enum: ['Veg', 'Non-Veg', 'Both'],
    default: ''
  },
  city: String,
  campus: String,
  profilePicture: String,
  coverPhoto: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);

