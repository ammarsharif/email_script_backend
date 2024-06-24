const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

router.post('/', async (req, res) => {
  const { token, tokenStatus, increment, plan } = req.body;

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

    if (existingProfile) {
      if (increment) {
        existingProfile.apiCalls += increment;
      }

      if (tokenStatus !== undefined) {
        existingProfile.tokenStatus = tokenStatus;
      }

      await existingProfile.save();
      const existingSubscription = await Subscription.findOne({
        userId: existingProfile._id,
      });
      if (existingSubscription) {
        if (plan) {
          existingSubscription.plan = plan;
          existingSubscription.startDate = new Date();
          existingSubscription.endDate = new Date(
            existingSubscription.startDate.getTime() +
              (plan === 'Monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
          );
          await existingSubscription.save();
        }
      } else {
        const newSubscription = new Subscription({
          userId: existingProfile._id,
          plan: plan || 'Free',
          startDate: new Date(),
          endDate: new Date(
            new Date().getTime() +
              (plan === 'Monthly' ? 30 : 365) * 24 * 60 * 60 * 1000
          ),
        });
        await newSubscription.save();
      }

      return res.status(200).json({
        message: increment
          ? 'Profile API calls incremented'
          : 'Profile updated',
        authenticated: true,
        profileImage: photoUrl,
        apiCalls: existingProfile.apiCalls,
      });
    } else {
      const newProfile = new Profile({
        name,
        emailAddress,
        photoUrl,
        tokenStatus: tokenStatus !== undefined ? tokenStatus : true,
        apiCalls: increment || 0,
      });

      await newProfile.save();

      const newSubscription = new Subscription({
        userId: newProfile._id,
        plan: 'Free',
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
      });
      await newSubscription.save();

      return res.status(200).json({
        message: 'Profile and subscription saved successfully',
        authenticated: true,
        profileImage: photoUrl,
        apiCalls: newProfile.apiCalls,
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
      { tokenStatus: false },
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
