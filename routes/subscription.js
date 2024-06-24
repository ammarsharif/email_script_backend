const express = require('express');
const Subscription = require('../models/Subscription');

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, plan } = req.body;
  if (!userId || !plan) {
    return res.status(400).json({ error: 'User ID and plan are required' });
  }

  try {
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    subscription.plan = plan;
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

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Subscription.findOne({ userId });
    console.log(profile);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json({ subscriptionPlan: profile.plan });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
