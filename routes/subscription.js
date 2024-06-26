const express = require('express');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, planTitle } = req.body;

  if (!userId || !planTitle) {
    return res
      .status(400)
      .json({ error: 'User ID and plan title are required' });
  }

  try {
    const subscriptionPlan = await SubscriptionPlan.findOne({ planTitle });

    if (!subscriptionPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    let subscription = await Subscription.findOne({ userId });

    const startDate = new Date();
    const endDate =
      planTitle === 'yearly'
        ? new Date(startDate.setFullYear(startDate.getFullYear() + 1))
        : new Date(startDate.setMonth(startDate.getMonth() + 1));

    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: subscriptionPlan.planTitle,
        planId: subscriptionPlan._id,
        apiCalls: 0,
        startDate,
        endDate,
      });
    } else {
      subscription.plan = subscriptionPlan.planTitle;
      subscription.planId = subscriptionPlan._id;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
    }

    await subscription.save();

    res.status(200).json({
      message: 'Subscription plan assigned successfully',
      subscription,
    });
  } catch (error) {
    console.error('Error assigning subscription plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/updateApiCount', async (req, res) => {
  const { userId, increment } = req.body;

  if (!userId || increment === undefined) {
    return res.status(400).json({ error: 'increment is required' });
  }
  try {
    let subscription = await Subscription.findOne({ userId });
    const subscriptionPlan = await SubscriptionPlan.findOne({
      _id: subscription.planId,
    });
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription not found' });
    }

    if (
      subscription.apiCalls >= subscriptionPlan.planApiCounts &&
      subscription.plan === 'free'
    ) {
      return res.status(403).json({ error: 'API LIMIT REACHED', ok: false });
    }
    subscription.apiCalls += increment;
    await subscription.save();

    res.status(200).json({
      message: 'Subscription API count updated successfully',
      subscription,
      ok: true,
    });
  } catch (error) {
    console.error('Error updating API count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.status(200).json({ subscriptionPlan: subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
