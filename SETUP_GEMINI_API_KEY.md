# Setting Up Gemini API Key

## Problem
The chat is not responding because `GEMINI_API_KEY` is not configured in your `.env` file.

## Solution

### Step 1: Get Your Free Gemini API Key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**
2. Click **"Create API Key"**
3. Select your project (or create a new one)
4. Copy the API key

### Step 2: Add to .env File

Open `.env` file and replace this line:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

With your actual API key:
```
GEMINI_API_KEY=sk_test_xyz1234567890abcdefg
```

### Step 3: Restart the Server

1. Stop the server (Ctrl+C if running)
2. Run: `npm start`
3. You should see: `Server running on port 3000`

### Step 4: Test the Chat

1. Login to your portfolio
2. Go to the Chat page
3. Ask a question like: "What is a binary search tree?"
4. The Gemini AI should now respond with academic explanations

## Troubleshooting

**"I'm still getting no response"**
- Check if API key is correctly pasted (no extra spaces)
- Make sure server was restarted after adding the key
- Check browser console for errors (F12 → Console)

**"API rate limited"**
- Free tier has rate limits
- Wait a few minutes and try again
- Upgrade to paid plan for higher limits

**"Invalid API key"**
- Double-check the key was pasted correctly
- Make sure no extra spaces at the beginning/end
- Generate a new key from Google AI Studio

## Features After Setup

Once configured, your AI will:
✅ Answer academic questions (CS, algorithms, coding)
✅ Solve homework problems
✅ Explain complex concepts
✅ Help debug code
✅ Show portfolio information
✅ Maintain conversation history
