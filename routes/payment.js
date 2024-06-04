const express = require('express');
const Payment = require('../models/Payment');
const squareClient = require('../config/square');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { token, buyer } = req.body;
    const newPayment = new Payment({ token, buyer });
    await newPayment.save();

    res.status(200).send('Payment information saved');
  } catch (error) {
    console.error('Error saving payment information:', error);
    res.status(500).send('Error saving payment information');
  }
});

router.post('/process-payment', async (req, res) => {
  const { sourceId, amount } = req.body;

  try {
    const response = await squareClient.paymentsApi.createPayment({
      sourceId: sourceId,
      idempotencyKey: new Date().getTime().toString(),
      amountMoney: {
        amount: amount,
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID
    });

    res.status(200).json(response.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
