# Limited Information Mode - Social Accounts Feature

## Overview

When a user hasn't connected any social media accounts, the Gemini AI is automatically limited to only provide information that exists in their portfolio. This prevents the AI from making assumptions about external profiles or claiming capabilities that haven't been set up.

## How It Works

### Social Accounts Connected ✅
When user has linked accounts (GitHub, LinkedIn, Dribbble, Medium, etc.):
- AI can reference connected profiles
- AI can mention external work and projects
- AI can direct users to social platforms
- Full portfolio context available

**Example:**
```
User: "Where can I find you online?"
AI: "You can find me on GitHub at username, LinkedIn at profile link, 
    and my work is also featured on Dribbble. Check them out!"
```

### No Social Accounts Connected ❌
When user hasn't linked any accounts:
- AI strictly limits responses to portfolio data only
- AI won't reference external platforms
- AI won't suggest connecting accounts
- AI won't make assumptions about external presence
- AI only discusses projects and basic info in portfolio

**Example:**
```
User: "Where can I find you online?"
AI: "Currently, no social media accounts are connected to this portfolio. 
    However, you can learn about my projects and experience right here in my portfolio."
```

## Constraint System

### Automatic Prompt Constraints

When no social connections exist, the AI receives these instructions:

```
IMPORTANT: The portfolio owner has NOT connected any social media accounts yet.
- Do NOT mention or reference any external profiles (GitHub, LinkedIn, Twitter, etc.)
- Do NOT make assumptions about their online presence
- Do NOT suggest or recommend connecting to any platforms
- Only provide information that is explicitly available in their portfolio
- If asked about external profiles, politely explain that no social accounts are currently connected
- Keep responses limited to the portfolio information: projects and basic profile details
- Be helpful and professional, but stay within the scope of what's available
```

## Implementation Details

### Code Location
**File:** `routes/chat.js`
**Function:** `generateGeminiResponse()`

### Logic Flow

```javascript
// Check if user has connected any social profiles
const hasConnections = userContext.connections && userContext.connections.length > 0;

// If no connections
if (!hasConnections) {
  // Add strict constraint instructions to system prompt
  systemPrompt += `
IMPORTANT: The portfolio owner has NOT connected any social media accounts yet.
- Do NOT mention or reference any external profiles...
- Do NOT make assumptions...
- Only provide information that is explicitly available...
  `;
} else {
  // Normal behavior with full context
  systemPrompt += `
You can discuss projects, skills, experience...
You may reference the connected profiles...`;
}
```

### What Counts as a "Connection"

A user is considered to have connected accounts if:
- ✅ GitHub account linked
- ✅ LinkedIn profile linked
- ✅ Dribbble account linked
- ✅ Medium profile linked
- ✅ Any custom social platform connected

Stored in: `social_connections` table in database

### What Counts as "Portfolio Information"

The AI can freely discuss:
- ✅ User's name and email
- ✅ Custom agent name and description
- ✅ User's projects (title, description, technologies)
- ✅ Persona type
- ✅ Any information explicitly added to portfolio

## Behavior Examples

### Scenario 1: User with No Connections

**User:** "Tell me about your GitHub"
**AI (Limited Mode):** "I haven't connected my GitHub account to this portfolio yet. However, you can explore my projects and experience right here in my portfolio. Would you like to know more about any specific project?"

**User:** "What's your email?"
**AI (Limited Mode):** "My email is [email]. Feel free to reach out!"

**User:** "What skills do you have?"
**AI (Limited Mode):** "Based on the projects in my portfolio, I have experience with [technologies from projects]. Check out my projects to see these skills in action!"

### Scenario 2: User with Connected Accounts

**User:** "Tell me about your GitHub"
**AI (Full Context):** "You can find me on GitHub at [username] where I have several repositories showcasing my work including [project names]. Feel free to check out my GitHub profile for more details!"

**User:** "What's your email?"
**AI (Full Context):** "My email is [email]. You can also reach me on LinkedIn at [profile] or check out my work on GitHub at [username]."

**User:** "What skills do you have?"
**AI (Full Context):** "I'm proficient in [technologies] as demonstrated in my GitHub repositories and portfolio projects. You can see my GitHub contributions and check out [specific projects] to see these skills in action."

## Configuration

### User Settings That Control This

No additional configuration needed! The feature is automatic:

1. When user connects social accounts in onboarding/settings
2. System automatically detects connected profiles
3. AI prompt adjusts automatically

### For Developers

To check if a user has connections:

```javascript
// In your code
const userContext = await getUserContext(userId);
const hasConnections = userContext.connections && userContext.connections.length > 0;

if (hasConnections) {
  console.log('User has connected accounts:', userContext.connections);
} else {
  console.log('User has NOT connected any accounts');
}
```

## Benefits

### For Users
✅ **Privacy Protection** - AI won't claim capabilities not set up
✅ **Accuracy** - Information is limited to what's explicitly provided
✅ **Control** - Users decide what information AI can reference
✅ **Professional** - No assumptions or made-up content

### For Site Visitors
✅ **Transparency** - Clear about what information is available
✅ **Trust** - AI stays within scope, doesn't overstate
✅ **Authentic** - Only real portfolio data is referenced

## Testing

### Test Case 1: No Connections
1. Create a new user account
2. Don't connect any social accounts
3. Go to chat
4. Ask: "Where can I find you on GitHub?"
5. Expected: AI should politely explain no accounts are connected

### Test Case 2: With Connections
1. Use same account
2. Connect GitHub account
3. Go to chat
4. Ask: "Where can I find you on GitHub?"
5. Expected: AI should provide GitHub link and profile info

### Test Case 3: Add Connection Later
1. Start with no connections (Chat limited)
2. Connect GitHub in settings
3. Refresh chat
4. Ask same question
5. Expected: AI now provides GitHub reference

## Advanced Features

### Progressive Enhancement
As users add more connections, AI responses become richer:

1. **No connections** → Basic project info only
2. **1 connection** → Can reference that platform
3. **Multiple connections** → Full cross-platform references
4. **Many projects + connections** → Comprehensive portfolio showcase

### Safe Fallback
If database query fails:
- AI defaults to "no connections" mode
- User still gets helpful response
- No information is fabricated

## Limitations & Design Choices

### Why This Matters
- **Prevents Hallucinations** - AI won't invent external profiles
- **Respects Privacy** - Only shares what user allows
- **Maintains Trust** - Honest about capabilities
- **Professional** - No false claims

### What Doesn't Change
- Chat still works perfectly without connections
- Projects are still valuable and discussed
- AI is still helpful and professional
- Profile info is still shared

## Integration with Onboarding

The onboarding flow encourages users to connect accounts:

1. User signs up
2. Goes through onboarding
3. Sees "Connect Accounts" step
4. Prompted to link GitHub, LinkedIn, etc.
5. Each connection unlocks richer AI responses

## Future Enhancements

Potential improvements:
- Display notification when AI is in "limited mode"
- Suggest connecting accounts in chat response
- Show connection status on chat page
- Track how many connections improve engagement
- Analytics on user connections vs. chat quality

## Troubleshooting

### AI is being too restrictive
- Check database: Are accounts actually stored in `social_connections`?
- Verify `hasConnections` boolean is correct
- Check system prompt in logs

### AI mentions profiles that aren't connected
- Verify connection was properly saved to database
- Check `social_connections` table
- Restart server to clear any caches

### User adds connection but AI still limited
- May need to refresh page
- Check if connection properly saved to database
- Verify user ID matches in query

## Code Reference

### Where to Modify

**File:** `routes/chat.js`

1. **Check Connections:**
   ```javascript
   const hasConnections = userContext.connections && userContext.connections.length > 0;
   ```

2. **Apply Constraints:**
   ```javascript
   if (!hasConnections) {
     // Add limitation instructions
   } else {
     // Normal instructions
   }
   ```

3. **Build Prompt:**
   ```javascript
   systemPrompt += `...`;
   ```

### Database Query

**Table:** `social_connections`
**Fields:** `user_id, platform, username, profile_url`

```sql
SELECT platform, username, profile_url 
FROM social_connections 
WHERE user_id = $1;
```

Returns: Array of connections (empty if none)

## Summary

The Limited Information Mode is an automatic safety feature that:
- ✅ Detects if user has connected accounts
- ✅ Adjusts AI constraints accordingly
- ✅ Prevents false information
- ✅ Maintains professional integrity
- ✅ Requires zero user configuration

It's a smart, transparent way to ensure the AI only represents what's actually true about the user's portfolio!
