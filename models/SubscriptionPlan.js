const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  planTitle: {
    type: String,
    enum: ['free', 'monthly', 'yearly'],
    default: 'free',
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

const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);

module.exports = SubscriptionPlan;
