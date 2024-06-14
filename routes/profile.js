const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

router.post('/', async (req, res) => {
  const { token, tokenStatus } = req.body;

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
    console.log(profileInfo);
    const name = names?.[0]?.displayName || '';
    const emailAddress = emailAddresses?.[0]?.value || '';
    const photoUrl = photos?.[0]?.url || '';

    const existingProfile = await Profile.findOne({ emailAddress });
    if (existingProfile) {
      if (existingProfile.tokenStatus) {
        return res.status(200).json({
          message: 'Profile already exists',
          authenticated: true,
          profileImage: photoUrl,
        });
      } else {
        existingProfile.tokenStatus = tokenStatus;
        await existingProfile.save();
        return res.status(200).json({
          message: 'Profile token status updated to true',
          authenticated: true,
          profileImage: photoUrl,
        });
      }
    }

    const newProfile = new Profile({
      name,
      emailAddress,
      photoUrl,
      tokenStatus: true,
    });
    await newProfile.save();

    res
      .status(200)
      .json({ message: 'Profile saved successfully', authenticated: true });
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
