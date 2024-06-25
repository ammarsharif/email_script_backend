const express = require('express');
const Profile = require('../models/Profile');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne({ emailAddress: req.query.email });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  const { token, status, increment } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const googleResponse = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!googleResponse.ok) {
      throw new Error('Failed to fetch profile info from Google');
    }

    const profileInfo = await googleResponse.json();
    const { names, emailAddresses, photos } = profileInfo;

    const name = names?.[0]?.displayName || '';
    const emailAddress = emailAddresses?.[0]?.value || '';
    const photoUrl = photos?.[0]?.url || '';

    let existingProfile = await Profile.findOne({ emailAddress });

    const subscriptionPlan = await SubscriptionPlan.findOne({
      planTitle: 'free',
    });
    if (existingProfile) {
      if (increment) {
        existingProfile.apiCalls += increment;
      }

      if (status !== undefined) {
        existingProfile.status = status;
      }

      await existingProfile.save();

      let subscription = await Subscription.findOne({
        userId: existingProfile._id,
      });
      if (!subscription) {
        const newSubscription = new Subscription({
          userId: existingProfile._id,
          plan: 'free',
          planId: subscriptionPlan._id,
          startDate: new Date(),
        });
        await newSubscription.save();
        subscription = newSubscription;
      }

      return res.status(200).json({
        message: increment
          ? 'Profile API calls incremented'
          : 'Profile updated',
        authenticated: true,
        profileImage: photoUrl,
        apiCalls: existingProfile.apiCalls,
        subscription,
      });
    } else {
      const newProfile = new Profile({
        name,
        emailAddress,
        photoUrl,
        status: status !== undefined ? status : true,
        apiCalls: increment || 0,
      });

      await newProfile.save();
      const newSubscription = new Subscription({
        userId: newProfile._id,
        plan: 'free',
        planId: subscriptionPlan._id,
        startDate: new Date(),
      });
      await newSubscription.save();

      return res.status(200).json({
        message: 'Profile saved successfully',
        authenticated: true,
        profileImage: photoUrl,
        apiCalls: newProfile.apiCalls,
        subscription: newSubscription,
      });
    }
  } catch (error) {
    console.error('Error handling profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { emailAddress } = req.body;
    if (!emailAddress) {
      return res.status(400).send('Email address is required');
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { emailAddress },
      { status: false },
      { new: true }
    );
    console.log(updatedProfile, 'UPDATED PROFILE');
    if (!updatedProfile) {
      console.log('No Profile found');
      return res.status(404).send('No profile found with that email address');
    }

    console.log('Profile status updated to false');
    res.status(200).send('Profile status updated to false');
  } catch (error) {
    console.error('Error updating profile status:', error);
    res.status(500).send('Error updating profile status');
  }
});

module.exports = router;
