const express = require('express');
const PortfolioAgent = require('./agent');
const router = express.Router();

// Store agent instances per user
const userAgents = new Map();

// Initialize agent for user 
router.post('/initialize', (req, res) => {
    const { userId, profileData } = req.body;
    
    const agent = new PortfolioAgent(profileData);
    agent.initialize(profileData);
    
    userAgents.set(userId, agent);
    
    res.json({ success: true, message: 'Agent initialized successfully' });
});

// Chat with agent
router.post('/chat', (req, res) => {
    const { userId, message } = req.body;
    
    const agent = userAgents.get(userId);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found. Please initialize first.' });
    }
    
    const response = agent.generateResponse(message);
    
    res.json({ 
        response,
        timestamp: new Date().toISOString()
    });
});

// Update agent profile
router.put('/update', (req, res) => {
    const { userId, profileData } = req.body;
    
    const agent = userAgents.get(userId);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    
    agent.updateProfile(profileData);
    
    res.json({ success: true, message: 'Agent updated successfully' });
});

module.exports = router; 