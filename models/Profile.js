const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: String,
  emailAddress: {
    type: String,
    required: true,
    unique: true 
  },
  photoUrl: String,
  paymentMethods: [{ 
    method: String, 
    createdAt: {
      type: Date,
      default: Date.now 
    },
  }],
  subscription: {
    type: String, 
    expiryDate: Date
  }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
