const express = require('express');
const { pool } = require('../database/init');

const router = express.Router();

// Get chat messages
router.get('/messages', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const result = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message and get AI response
router.post('/message', async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;
  
  // Simple AI response logic (you can enhance this with actual AI)
  const generateResponse = (message) => {
    const responses = [
      "I'm your AI Portfolio Agent. I can help you showcase your work and answer questions about your projects.",
      "Based on your portfolio, I can see you have experience in web development and design. What specific project would you like to discuss?",
      "I'd be happy to help potential clients understand your skills and experience. What would you like to know?",
      "Your portfolio shows strong technical skills. I can provide detailed information about any of your projects."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  
  const response = generateResponse(message);
  
  try {
    const result = await pool.query(
      'INSERT INTO chat_messages (user_id, message, response) VALUES ($1, $2, $3) RETURNING id, created_at',
      [userId, message, response]
    );
    
    res.json({
      id: result.rows[0].id,
      message,
      response,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;