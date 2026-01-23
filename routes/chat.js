const express = require('express');
const axios = require('axios');
const { pool } = require('../database/init');

const router = express.Router();

// Ensure env variables are loaded
if (!process.env.OPENROUTER_API_KEY) {
  require('dotenv').config();
}

// Initialize Open Router API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

// Debug logging
console.log('📌 Chat Route Initialization:');
console.log(`  - OPENROUTER_API_KEY: ${OPENROUTER_API_KEY ? '✓ Loaded (' + OPENROUTER_API_KEY.substring(0, 20) + '...)' : '✗ Not loaded'}`);
console.log(`  - OPENROUTER_MODEL: ${OPENROUTER_MODEL}`);

// Get user context for AI
async function getUserContext(userId) {
  try {
    // Fetch user profile
    const userResult = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [userId]
    );
    
    // Fetch user details from settings
    const settingsResult = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    
    // Fetch user projects
    const projectsResult = await pool.query(
      'SELECT title, description, technologies FROM projects WHERE user_id = $1 LIMIT 10',
      [userId]
    );
    
    // Fetch social connections
    const connectionsResult = await pool.query(
      'SELECT platform, username, profile_url FROM social_connections WHERE user_id = $1',
      [userId]
    );
    
    const user = userResult.rows[0] || {};
    const settings = settingsResult.rows[0] || {};
    const projects = projectsResult.rows || [];
    const connections = connectionsResult.rows || [];
    
    const userContext = {
      name: user.name || 'Unknown',
      email: user.email || '',
      agentName: settings.agent_name || user.name || 'AI Portfolio Agent',
      personaType: settings.persona_type || 'professional',
      agentDescription: settings.agent_description || 'An AI assistant showcasing professional portfolio.',
      // User professional details
      professionalBio: settings.bio || '',
      skills: settings.skills ? JSON.parse(settings.skills) : [],
      yearsExperience: settings.years_experience || 0,
      specialties: settings.specialties ? JSON.parse(settings.specialties) : [],
      currentRole: settings.role_title || '',
      // Projects and connections
      projects: projects.map(p => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies
      })),
      connections: connections.map(c => ({
        platform: c.platform,
        username: c.username,
        profileUrl: c.profile_url
      }))
    };
    
    return userContext;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return { name: 'User', agentName: 'AI Portfolio Agent', projects: [], connections: [] };
  }
}

// Generate AI response using Open Router with fallback to free service
async function generateAIResponse(userMessage, userContext) {
  // Check if API key is configured
  const hasValidKey = OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'sk-or-v1-REPLACE_WITH_YOUR_KEY' && OPENROUTER_API_KEY.length > 10;
  
  if (!hasValidKey) {
    console.log('Open Router API key not configured, using fallback...');
    return await generateAIResponseFallback(userMessage, userContext);
  }
  
  try {
    // Prepare the system prompt
    const systemPrompt = buildSystemPrompt(userContext);
    
    console.log(`Calling Open Router API (${OPENROUTER_MODEL})...`);
    
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Portfolio Agent'
        },
        timeout: 30000
      }
    );
    
    // Check for response
    if (response.data.choices && response.data.choices[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }
    
    console.error('Unexpected response format:', response.data);
    return await generateAIResponseFallback(userMessage, userContext);
    
  } catch (error) {
    console.error('Open Router API error:');
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data?.error?.message || error.message);
    
    // Always fallback gracefully on any error
    console.log('Open Router failed, trying fallback API...');
    return await generateAIResponseFallback(userMessage, userContext);
  }
}

// Fallback to free Hugging Face Inference API
async function generateAIResponseFallback(userMessage, userContext) {
  try {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (!hfApiKey) {
      console.log('Using mock response fallback...');
      return generateMockResponse(userMessage, userContext);
    }
    
    console.log('Calling Hugging Face API...');
    
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
        {
          inputs: `<s>[INST] You are a helpful AI assistant. Answer this question: ${userMessage} [/INST]`,
          parameters: {
            max_length: 500,
            temperature: 0.7
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${hfApiKey}`
          },
          timeout: 30000
        }
      );
      
      if (response.data && Array.isArray(response.data) && response.data[0]?.generated_text) {
        return response.data[0].generated_text.substring(userMessage.length);
      }
    } catch (hfError) {
      console.error('Hugging Face API error:', hfError.message);
    }
    
    return generateMockResponse(userMessage, userContext);
    
  } catch (error) {
    console.error('Fallback error:', error.message);
    // Always fallback to mock response
    return generateMockResponse(userMessage, userContext);
  }
}

// Mock response generator for when APIs aren't available
function generateMockResponse(userMessage, userContext) {
  console.log('Mock response for message:', userMessage);
  const msg = userMessage.toLowerCase().trim();
  
  // Greetings
  if (msg === 'hi' || msg === 'hello' || msg === 'hey') {
    return `Hello! 👋 I'm an AI assistant helping visitors learn about ${userContext.name}'s work and skills. I can answer questions about computer science, algorithms, data structures, and more. What would you like to know?`;
  }
  
  if (msg === 'gi') {
    return `I think you meant "hi"? 😊 Hello! I'm here to help with CS questions and portfolio information.`;
  }
  
  // Academic CS responses
  if (msg.includes('binary search') || msg.includes('bst')) {
    return `A Binary Search Tree (BST) is a data structure where each node has at most two children (left and right). Key properties:
- Left child < Parent < Right child
- Enables O(log n) search, insert, delete on average
- Becomes O(n) if unbalanced (use AVL or Red-Black trees for balance)

Example:
      5
     / \\
    3   7
   / \\ / \\
  2  4 6  8

Time Complexities:
- Search: O(log n) average, O(n) worst
- Insert: O(log n) average, O(n) worst  
- Delete: O(log n) average, O(n) worst`;
  }
  
  if (msg.includes('algorithm') || msg.includes('sort')) {
    return `Common Sorting Algorithms:

1. **Quick Sort** - O(n log n) average, O(n²) worst, in-place
2. **Merge Sort** - O(n log n) guaranteed, stable, needs O(n) space
3. **Heap Sort** - O(n log n) guaranteed, in-place
4. **Insertion Sort** - O(n²) average, good for small arrays
5. **Bubble Sort** - O(n²), simple but inefficient

Choose based on:
- Data size
- Stability needs
- Memory constraints
- Already sorted data`;
  }
  
  if (msg.includes('hash') || msg.includes('hashtable')) {
    return `Hash Tables / Hash Maps:
- Use hash function to map keys to indices
- Average O(1) lookup, insert, delete
- Collisions handled by chaining or probing
- Load factor affects performance
- Good for caching and rapid lookups`;
  }
  
  if (msg.includes('portfolio') || msg.includes('project')) {
    return `I can help you showcase your portfolio! You have ${userContext.projects?.length || 0} projects listed. 
Your name is ${userContext.name}. I can help visitors learn about your work and answer technical questions.`;
  }
  
  // Generic response
  return `I'm running on a fallback system because the main AI API is unavailable. 

I can help with:
- Data structures (arrays, linked lists, trees, graphs, hash tables)
- Algorithms (sorting, searching, dynamic programming)
- Time complexity analysis
- Computer Science concepts
- Your portfolio and projects

Try asking me about: "What is a binary search tree?" or "Explain quick sort"`;
}

// Build system prompt
function buildSystemPrompt(userContext) {
  const hasConnections = userContext.connections && userContext.connections.length > 0;
  
  let prompt = `You are ${userContext.agentName || 'AI Assistant'}, helping visitors learn about ${userContext.name}'s work and experience.

About ${userContext.name}:`;
  
  if (userContext.professionalBio) {
    prompt += `\n- Bio: ${userContext.professionalBio}`;
  }
  
  if (userContext.currentRole) {
    prompt += `\n- Current Role: ${userContext.currentRole}`;
  }
  
  if (userContext.yearsExperience > 0) {
    prompt += `\n- Experience: ${userContext.yearsExperience} years`;
  }
  
  if (userContext.skills && userContext.skills.length > 0) {
    prompt += `\n- Key Skills: ${userContext.skills.join(', ')}`;
  }
  
  if (userContext.specialties && userContext.specialties.length > 0) {
    prompt += `\n- Specialties: ${userContext.specialties.join(', ')}`;
  }
  
  if (userContext.projects && userContext.projects.length > 0) {
    prompt += `\n- Projects: ${userContext.projects.map(p => p.title).join(', ')}`;
  }
  
  if (hasConnections) {
    prompt += `\n- Connected on: ${userContext.connections.map(c => c.platform).join(', ')}`;
  }
  
  prompt += `\n\nYour role:
1. Answer questions about ${userContext.name}'s background, skills, and projects
2. Help with Computer Science, algorithms, and data structures
3. Discuss the visitor's interests and how they relate to ${userContext.name}'s experience
4. Be friendly, professional, and informative
5. If asked about portfolio items, provide relevant details
6. For technical questions, explain clearly with examples

Keep responses helpful, clear, and tailored to what the visitor wants to know.`;

  return prompt;
}

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
  
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }
  
  try {
    // Get user context
    const userContext = await getUserContext(userId);
    
    // Generate AI response using OpenAI
    const aiResponse = await generateAIResponse(message.trim(), userContext);
    
    // Store in database
    const result = await pool.query(
      'INSERT INTO chat_messages (user_id, message, response) VALUES ($1, $2, $3) RETURNING id, created_at',
      [userId, message, aiResponse]
    );
    
    res.json({
      id: result.rows[0].id,
      message,
      response: aiResponse,
      created_at: result.rows[0].created_at
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

module.exports = router;