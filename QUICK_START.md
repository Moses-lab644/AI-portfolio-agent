# Quick Start: Gemini AI Chat Integration

## 30-Second Setup

1. **Get API Key** (1 minute)
   - Go to: https://aistudio.google.com/app/apikeys
   - Click "Create API Key"
   - Copy the key

2. **Add to .env** (30 seconds)
   ```
   GEMINI_API_KEY=your-copied-key-here
   ```

3. **Start Server** (30 seconds)
   ```powershell
   npm install
   npm start
   ```

4. **Test It** (1 minute)
   - Open http://localhost:3000
   - Login with your account
   - Go to Chat page
   - Type: "What projects do I have?"

Done! 🎉

## What Happens

When you send a message:

1. System fetches your profile data
2. Gets your projects & connections
3. Sends everything to Gemini AI
4. AI generates a smart response
5. Response appears in chat

## Example Interactions

**User:** "Tell me about your projects"
**AI:** "Based on my portfolio, I have [your actual projects] built with [your technologies]..."

**User:** "What skills do you have?"
**AI:** "I'm proficient in [technologies from your projects] and experienced with [your tech stack]..."

**User:** "Where can I find you online?"
**AI:** "You can find me on [your connected profiles: GitHub, LinkedIn, etc.]"

## Common Issues

| Issue | Solution |
|-------|----------|
| "AI service not configured" | Add GEMINI_API_KEY to .env and restart |
| "Network error" | Check internet & API key validity |
| Generic AI responses | Add projects & connections to your profile |
| Slow responses (5+ sec) | Normal, Gemini takes 2-6 seconds |

## Files You Need

- ✅ `.env` - with GEMINI_API_KEY
- ✅ `routes/chat.js` - Gemini integration (done)
- ✅ `chat.html` - Chat UI (done)
- ✅ Database - for storing messages

## Environment Variables

```dotenv
# Required
GEMINI_API_KEY=your-key-here

# Already configured
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
PORT=3000
NODE_ENV=development
SESSION_SECRET=...
```

## API Key Types

**Free Tier** (No credit card)
- 60 requests/minute
- 1,500 requests/day
- Perfect for testing

**Paid Tier** (Credit card required)
- Higher limits
- Professional use
- Pay-per-use pricing

## Next Steps After Setup

1. ✅ API key added
2. ✅ Server running
3. Chat feature working
4. Add more projects for better AI context
5. Connect social profiles (GitHub, LinkedIn)
6. Customize agent name & description
7. Share chat link with others
8. Monitor API usage in Google Cloud Console

## Useful Commands

```powershell
# Start development server
npm run dev

# Start production server
npm start

# Check Node version
node -v

# Check npm version
npm -v

# Update packages
npm update

# Install specific package
npm install package-name
```

## Verify Setup

Check if integration is working:

1. Open browser console (F12)
2. Send a chat message
3. Look for network request to `/api/chat/message`
4. Verify response contains AI message

Server logs should show:
```
[Info] Chat request from user [id]
[Info] Fetching user context...
[Info] Calling Gemini API...
[Info] Response generated successfully
```

## Getting Help

1. **Setup Issues?**
   - Read: `SETUP_GEMINI.md`

2. **Integration Details?**
   - Read: `GEMINI_INTEGRATION.md`

3. **API Key Issues?**
   - Visit: https://aistudio.google.com/app/apikeys
   - Check API quota in Google Cloud Console

4. **Code Issues?**
   - Check server logs: `npm start`
   - Check browser console: F12
   - Review `routes/chat.js` for errors

## Pro Tips

✨ **Better AI Responses**
- Add detailed project descriptions
- Connect all your social profiles
- Set a custom agent name/description
- Use specific, detailed questions

⚡ **Performance**
- First response may take 3-5 seconds
- Subsequent responses are faster
- Chat history saves all messages

💰 **Cost Management**
- Free tier: 1,500 requests/day
- Approximately $0.00125 per request (paid)
- Monitor usage in Google Cloud Console

🔒 **Security**
- API key in `.env` only (not in code)
- Token-based authentication
- User data stays in your database

## More Documentation

- API reference: `GEMINI_INTEGRATION.md`
- Setup guide: `SETUP_GEMINI.md`
- Full README: `README.md`

---

**You're all set!** 🚀

Open http://localhost:3000 and start chatting with your AI portfolio agent.
