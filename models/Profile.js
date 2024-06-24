const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: String,
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  photoUrl: String,
  tokenStatus: Boolean,
  apiCalls: Number,
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
