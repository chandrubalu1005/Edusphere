const Profile = require('../models/Profile');
const { minioClient, bucketName } = require('../config/minio');
const crypto = require('crypto');
const path = require('path');

exports.searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const filter = { active: true };
    if (q) {
      filter.$or = [
        { username: new RegExp(q, 'i') },
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ];
    }
    
    const profiles = await Profile.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Profile.countDocuments(filter);

    res.json({
      profiles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Can only update own profile.' });
    }

    const { firstName, lastName, bio, preferences } = req.body;
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (bio !== undefined) profile.bio = bio;
    
    if (req.body.links) {
      if (req.body.links.github !== undefined) profile.links.github = req.body.links.github;
      if (req.body.links.linkedin !== undefined) profile.links.linkedin = req.body.links.linkedin;
      if (req.body.links.portfolio !== undefined) profile.links.portfolio = req.body.links.portfolio;
    }

    if (preferences !== undefined) {
      if (preferences.darkMode !== undefined) profile.preferences.darkMode = preferences.darkMode;
      if (preferences.themeName !== undefined) profile.preferences.themeName = preferences.themeName;
    }

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deactivateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Admins only.' });
    }

    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile.active = false;
    await profile.save();

    res.json({ message: 'Profile deactivated successfully', profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkUpdateProfiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Admins only.' });
    }
    const { userIds, active } = req.body;
    if (!userIds || !Array.isArray(userIds) || active === undefined) {
      return res.status(400).json({ error: 'userIds array and active boolean are required' });
    }
    await Profile.updateMany({ userId: { $in: userIds } }, { active });
    res.json({ message: `Successfully updated ${userIds.length} profiles.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (req.user.userId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access forbidden. Can only upload own avatar.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const fileExt = path.extname(req.file.originalname);
    const objectName = `avatar_${req.params.id}_${crypto.randomBytes(4).toString('hex')}${fileExt}`;
    
    await minioClient.putObject(bucketName, objectName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype
    });
    
    const avatarUrl = `/${bucketName}/${objectName}`;
    profile.avatarUrl = avatarUrl;
    await profile.save();
    
    res.json({ message: 'Avatar uploaded successfully', avatarUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
