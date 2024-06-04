const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  token: Object,
  buyer: {
    type: Object,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
