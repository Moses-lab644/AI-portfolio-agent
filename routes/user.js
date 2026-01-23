const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../database/init');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const result = await pool.query('SELECT id, email, name, profile_picture, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  const userId = req.user.userId;
  const { name, professionalBio, skills, yearsExperience, specialties, currentRole } = req.body;
  
  try {
    // Update basic user info
    if (name) {
      await pool.query('UPDATE users SET name = $1 WHERE id = $2', [name, userId]);
    }
    
    // Update user settings with professional details
    const skillsJson = skills ? JSON.stringify(skills) : null;
    const specialtiesJson = specialties ? JSON.stringify(specialties) : null;
    
    // Check if settings exist
    const settingsCheck = await pool.query('SELECT id FROM user_settings WHERE user_id = $1', [userId]);
    
    if (settingsCheck.rows.length > 0) {
      // Update existing settings
      await pool.query(`
        UPDATE user_settings 
        SET bio = $1, skills = $2, years_experience = $3, specialties = $4, role_title = $5
        WHERE user_id = $6
      `, [professionalBio || null, skillsJson, yearsExperience || 0, specialtiesJson, currentRole || null, userId]);
    } else {
      // Create new settings
      await pool.query(`
        INSERT INTO user_settings (user_id, bio, skills, years_experience, specialties, role_title)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, professionalBio || null, skillsJson, yearsExperience || 0, specialtiesJson, currentRole || null]);
    }
    
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;