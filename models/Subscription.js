const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    default: 'free',
    required: true,
  },
  planTitle: {
    type: String,
    required: true,
  },
  planFeatures: {
    type: [String],
    required: true,
  },
  planPrice: {
    type: Number,
    required: true,
  },
  planApiCounts: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
