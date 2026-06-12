const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// configure multer to store uploaded files in /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'resume' ? 'resume' : 'profile';
    cb(null, `${prefix}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Get profile by userId (passed as param)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // return profile fields
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || '',
      country: user.country || '',
      bio: user.bio || '',
      institution: user.company || user.institution || '',
      specialization: user.profession || user.specialization || '',
      experience: user.experience || '',
      skillsToTeach: (user.skillsToTeach || []).join(','),
      skillsToLearn: (user.skillsToLearn || []).join(','),
      resume: user.resume || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      portfolio: user.portfolio || '',
      interests: user.interests || '',
      profileType: user.profileType || 'avatar',
      avatarUrl: user.avatarUrl || '',
      profileImage: user.profileImage || '',
      teachingStats: user.teachingStats || [],
    };

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/:userId', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const {
      name,
      role,
      country,
      bio,
      institution,
      specialization,
      experience,
      skillsToTeach,
      skillsToLearn,
      github,
      linkedin,
      portfolio,
      interests,
      profileType,
      avatarUrl
    } = req.body;

    if (name) user.name = name;
    if (role) user.role = role;
    if (country) user.country = country;
    if (bio) user.bio = bio;
    if (institution) user.company = institution;
    if (specialization) user.profession = specialization;
    if (experience) user.experience = experience;
    if (profileType) user.profileType = profileType;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    // Normalize and save skills
    if (skillsToTeach !== undefined) {
      user.skillsToTeach = Array.isArray(skillsToTeach)
        ? skillsToTeach
        : (skillsToTeach ? skillsToTeach.split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (skillsToLearn !== undefined) {
      user.skillsToLearn = Array.isArray(skillsToLearn)
        ? skillsToLearn
        : (skillsToLearn ? skillsToLearn.split(',').map(s => s.trim()).filter(Boolean) : []);
    }

    // Optional fields
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (portfolio !== undefined) user.portfolio = portfolio;
    if (interests !== undefined) user.interests = interests;

    // Handle File Uploads
    if (req.files) {
      // Resume Upload
      if (req.files['resume']) {
        if (user.resume) {
          try {
            const prevPath = path.join(__dirname, '..', user.resume);
            if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
          } catch (e) { console.warn('Failed to remove previous resume:', e.message); }
        }
        user.resume = `/uploads/${req.files['resume'][0].filename}`;
      }

      // Profile Image Upload
      if (req.files['profileImage']) {
        if (user.profileImage) {
          try {
            const prevPath = path.join(__dirname, '..', user.profileImage);
            if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
          } catch (e) { console.warn('Failed to remove previous profile image:', e.message); }
        }
        user.profileImage = `/uploads/${req.files['profileImage'][0].filename}`;
        user.profileType = 'image'; // Auto switch to image if uploaded
      }
    }

    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
