const express = require('express');
const axios = require('axios');
const { pool } = require('../database/init');

const router = express.Router();

// Get portfolio connections
router.get('/connections/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM portfolio_connections WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Connect platform
router.post('/connect', async (req, res) => {
  const { userId, platform, data } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO portfolio_connections (user_id, platform, connected, data) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, platform) DO UPDATE SET connected = $3, data = $4 RETURNING id',
      [userId, platform, true, JSON.stringify(data || {})]
    );
    
    res.json({
      id: result.rows[0].id,
      platform,
      connected: true,
      message: `${platform} connected successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Disconnect platform
router.post('/disconnect', async (req, res) => {
  const { userId, platform } = req.body;
  
  try {
    await pool.query(
      'UPDATE portfolio_connections SET connected = FALSE WHERE user_id = $1 AND platform = $2',
      [userId, platform]
    );
    
    res.json({
      platform,
      connected: false,
      message: `${platform} disconnected successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Connect social platform
router.post('/connect/:platform', async (req, res) => {
  const { platform } = req.params;
  const { username, profileUrl } = req.body;
  const userId = req.user.userId;
  
  // Validate required fields
  if (!userId) {
    return res.status(401).json({ success: false, error: 'User not authenticated' });
  }
  
  if (!platform) {
    return res.status(400).json({ success: false, error: 'Platform is required' });
  }
  
  try {
    let profileData = {};
    
    // Fetch data based on platform
    switch(platform.toLowerCase()) {
      case 'github':
        if (!username) {
          return res.status(400).json({ success: false, error: 'GitHub username is required' });
        }
        try {
          const response = await axios.get(`https://api.github.com/users/${username}`);
          profileData = {
            name: response.data.name,
            bio: response.data.bio,
            followers: response.data.followers,
            public_repos: response.data.public_repos,
            avatar_url: response.data.avatar_url
          };
        } catch (error) {
          return res.status(400).json({ success: false, error: 'GitHub user not found' });
        }
        break;
        
      case 'linkedin':
        if (!profileUrl) {
          return res.status(400).json({ success: false, error: 'LinkedIn profile URL is required' });
        }
        profileData = { username: username || '', profileUrl, platform: 'linkedin' };
        break;
        
      case 'dribbble':
        if (!username) {
          return res.status(400).json({ success: false, error: 'Dribbble username is required' });
        }
        profileData = { username, profileUrl };
        break;
        
      case 'medium':
        if (!username) {
          return res.status(400).json({ success: false, error: 'Medium username is required' });
        }
        profileData = { username, profileUrl };
        break;
        
      default:
        return res.status(400).json({ success: false, error: 'Unsupported platform' });
    }
    
    // Store connection in database
    await pool.query(
      'INSERT INTO social_connections (user_id, platform, username, profile_url, profile_data) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, platform) DO UPDATE SET username = $3, profile_url = $4, profile_data = $5',
      [userId, platform, username, profileUrl, JSON.stringify(profileData)]
    );
    
    res.json({ success: true, data: profileData, message: `${platform} connected successfully` });
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ success: false, error: 'Failed to connect platform' });
  }
});

// Get user's connections
router.get('/connections', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const result = await pool.query(
      'SELECT platform, username, profile_url, profile_data, connected_at FROM social_connections WHERE user_id = $1',
      [userId]
    );
    
    const connections = result.rows.map(row => ({
      ...row,
      profile_data: typeof row.profile_data === 'string' ? JSON.parse(row.profile_data) : row.profile_data
    }));
    
    res.json({ connections });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

module.exports = router;