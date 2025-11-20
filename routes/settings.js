const express = require('express');
const { db } = require('../database/init');

const router = express.Router();

// Get user settings
router.get('/', (req, res) => {
  const userId = req.user.userId;
  
  db.get(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [userId],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = {
          persona_type: 'professional',
          agent_name: 'Portfolio Agent',
          agent_description: 'AI assistant for professional portfolio',
          public_url: `agent-${userId}`
        };
        
        db.run(
          'INSERT INTO user_settings (user_id, persona_type, agent_name, agent_description, public_url) VALUES (?, ?, ?, ?, ?)',
          [userId, defaultSettings.persona_type, defaultSettings.agent_name, defaultSettings.agent_description, defaultSettings.public_url],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create settings' });
            }
            res.json({ id: this.lastID, user_id: userId, ...defaultSettings });
          }
        );
      } else {
        res.json(settings);
      }
    }
  );
});

// Update user settings
router.put('/', (req, res) => {
  const userId = req.user.userId;
  const { personaType, agentName, agentDescription, publicUrl } = req.body;
  
  db.run(
    'UPDATE user_settings SET persona_type = ?, agent_name = ?, agent_description = ?, public_url = ? WHERE user_id = ?',
    [personaType, agentName, agentDescription, publicUrl, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }
      
      if (this.changes === 0) {
        // Create settings if they don't exist
        db.run(
          'INSERT INTO user_settings (user_id, persona_type, agent_name, agent_description, public_url) VALUES (?, ?, ?, ?, ?)',
          [userId, personaType, agentName, agentDescription, publicUrl],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create settings' });
            }
            res.json({ message: 'Settings created successfully' });
          }
        );
      } else {
        res.json({ message: 'Settings updated successfully' });
      }
    }
  );
});

module.exports = router;