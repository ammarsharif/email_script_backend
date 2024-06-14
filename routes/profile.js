const express = require('express');
const Profile = require('../models/Profile');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { names, emailAddresses, photos, tokenStatus } = req.body;
    const name = names?.[0]?.displayName || '';
    const emailAddress = emailAddresses?.[0]?.value || '';
    const photoUrl = photos?.[0]?.url || '';

    const existingProfile = await Profile.findOne({ emailAddress });
    if (existingProfile) {
      if (existingProfile.tokenStatus) {
        return res.status(200).json({ message: 'Profile already exists', authenticated: true });
      } else {
        return res.status(200).json({ message: 'Profile already exists', authenticated: false });
      }
    }
    const newProfile = new Profile({ name, emailAddress, photoUrl, tokenStatus });
    console.log(newProfile,'NEW PROFILE DATA:::::');
    await newProfile.save();
    res.status(200).send('Profile saved');
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).send('Error saving profile');
  }
});

router.delete('/', async (req, res) => {
  try {
    const { emailAddress } = req.body;
    if (!emailAddress) {
      return res.status(400).send('Email address is required');
    }

    const result = await Profile.deleteOne({ emailAddress });
    if (result.deletedCount === 0) {
      console.log('No Profile found');
      return res.status(404).send('No profile found with that email address');
    }
    console.log('Profile deleted');
    res.status(200).send('Profile deleted');
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).send('Error deleting profile');
  }
});

module.exports = router;
