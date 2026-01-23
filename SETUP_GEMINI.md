# Gemini AI Chat Integration Guide

This application now includes AI-powered chat capabilities using Google's Gemini API. The chat system retrieves user information and generates context-aware responses.

## Quick Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Create API Key" button
3. Copy your API key
4. Add it to your `.env` file:

```
GEMINI_API_KEY=your-copied-api-key-here
```

### 2. Restart Your Server

```powershell
npm start
```

That's it! The chat feature will now be fully functional.

## How It Works

### User Context Retrieval

When a user sends a message in the chat, the system:

1. **Fetches User Profile**
   - Name
   - Email
   - Custom agent name and description
   - Persona type (professional, creative, academic, etc.)

2. **Retrieves Projects**
   - Project titles, descriptions, and technologies
   - Up to 10 most recent projects

3. **Gets Social Connections**
   - Connected platforms (GitHub, LinkedIn, Dribbble, Medium)
   - Usernames and profile URLs

4. **Creates System Prompt**
   - Builds a comprehensive prompt with all user data
   - Personalizes the AI agent with user information

### AI Response Generation

- Sends the system prompt + user message to Gemini API
- Gemini generates context-aware responses based on user data
- Response is stored in the database for history
- Response appears in the chat UI

## API Details

### Chat Endpoints

#### Send Message
```
POST /api/chat/message
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
  {
    "message": "Tell me about your projects"
  }

Response:
  {
    "id": 123,
    "message": "Tell me about your projects",
    "response": "Based on my portfolio, I have...",
    "created_at": "2024-01-22T10:30:00Z"
  }
```

#### Get Message History
```
GET /api/chat/messages
Headers:
  Authorization: Bearer <token>

Response:
  [
    {
      "id": 1,
      "user_id": 123,
      "message": "What skills do you have?",
      "response": "I'm proficient in...",
      "created_at": "2024-01-22T10:00:00Z"
    },
    ...
  ]
```

## Configuration

### System Prompt Structure

The AI agent receives a system prompt that includes:

```
You are [Agent Name], an AI portfolio assistant.
Your persona type is: [Professional/Creative/Academic/etc]
Description: [Custom agent description]

About the portfolio owner:
- Name: [User Name]
- Email: [User Email]

Projects:
- [Project 1]: [Description] (Tech: [Technologies])
- [Project 2]: [Description] (Tech: [Technologies])

Connected Profiles:
- github: username (url)
- linkedin: username (url)

[Additional context]

You are helpful, professional, and provide specific information...
```

### Customizing the Agent

Users can customize their AI agent in the Dashboard Settings:
- **Agent Name**: How the AI introduces itself
- **Agent Description**: What the AI does
- **Persona Type**: Professional, Creative, Enthusiastic, etc.

## Troubleshooting

### "AI service not configured" Error

Make sure `GEMINI_API_KEY` is set in your `.env` file and the server has been restarted.

### "Failed to get response" Error

1. Check that your API key is valid
2. Ensure you have remaining API quota
3. Check server console for detailed error messages
4. Verify network connectivity

### Rate Limiting

Google provides a free tier with:
- 60 requests per minute
- 1,500 requests per day

If you exceed these limits, upgrade to a paid plan in [Google Cloud Console](https://console.cloud.google.com/).

## Advanced Options

### Customizing Generation Parameters

Edit `routes/chat.js`, function `generateGeminiResponse`:

```javascript
generationConfig: {
  temperature: 0.7,      // 0-2: Lower = more deterministic, Higher = more creative
  topK: 40,              // Consider top K tokens
  topP: 0.95,            // Use nucleus sampling
  maxOutputTokens: 500   // Max response length
}
```

### Safety Settings

The API includes content filtering for:
- HARM_CATEGORY_HARASSMENT
- HARM_CATEGORY_HATE_SPEECH

Adjust thresholds in the safety settings array if needed.

## Features Enabled by Gemini Integration

✅ **Context-Aware Chat** - Responses based on user's actual portfolio data
✅ **Project Showcase** - AI can discuss specific user projects
✅ **Personalized Agent** - Custom name, description, and persona
✅ **Social Profile Integration** - References connected accounts
✅ **Professional Conversations** - Handles client inquiries naturally
✅ **Chat History** - All conversations saved to database

## Environment Variables

```dotenv
# Required for AI chat
GEMINI_API_KEY=your-api-key-here

# Optional: customize request timeout (milliseconds)
# GEMINI_TIMEOUT=30000

# Optional: set API endpoint (default shown)
# GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## Next Steps

1. ✅ Get API key from Google AI Studio
2. ✅ Add to `.env` file
3. ✅ Restart server
4. ✅ Test chat functionality
5. Add user projects and connections for better AI context
6. Customize agent settings in dashboard
7. Deploy to production with valid API key

For more information, visit [Google AI Documentation](https://ai.google.dev/)
