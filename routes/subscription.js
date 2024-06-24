const express = require('express');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, plan, planTitle, planPrice, features } = req.body;
  if (!userId || !plan || !planTitle || !planPrice || !features) {
    return res
      .status(400)
      .json({
        error: 'User ID, plan, planTitle, planPrice, and features are required',
      });
  }

  try {
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.plan = plan;
    subscription.planTitle = planTitle;
    subscription.planPrice = planPrice;
    subscription.features = features;
    subscription.startDate = new Date();

    if (plan === 'monthly') {
      subscription.endDate = new Date(
        new Date().setMonth(new Date().getMonth() + 1)
      );
    } else if (plan === 'yearly') {
      subscription.endDate = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      );
    } else {
      subscription.endDate = null;
    }

    await subscription.save();

    res
      .status(200)
      .json({ message: 'Subscription updated successfully', subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET route to fetch subscription by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.status(200).json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
