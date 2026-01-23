# Testing Guide: Gemini AI Integration

## Pre-Integration Testing Checklist

Before testing the AI chat, ensure:

- [ ] Node.js server is running (`npm start`)
- [ ] `.env` file contains `GEMINI_API_KEY`
- [ ] Database is connected and migrated
- [ ] You're logged in to the application
- [ ] Browser console is open (F12)

## Manual Testing Scenarios

### Test 1: Basic AI Response

**Objective:** Verify AI can receive and respond to messages

**Steps:**
1. Navigate to `/chat.html`
2. In chat input, type: `"Hello, who are you?"`
3. Click send or press Enter

**Expected Result:**
- Loading indicator appears (animated dots)
- After 2-6 seconds, AI responds with introduction
- Response mentions the user's name or agent name
- Message appears in chat history

**Success Criteria:**
```
✅ Message sent successfully
✅ Loading indicator showed
✅ Response received within 6 seconds
✅ Response is personalized
✅ No errors in browser console
```

---

### Test 2: User Context Integration

**Objective:** Verify AI retrieves and uses user profile data

**Setup:**
1. Add a project in dashboard:
   - Title: "Weather App"
   - Description: "Real-time weather app with React"
   - Technologies: "React, Node.js, MongoDB"

**Steps:**
1. Go to chat
2. Type: `"What projects have you built?"`
3. Send message

**Expected Result:**
- AI mentions "Weather App" by name
- Includes technologies: React, Node.js, MongoDB
- Provides description from database

**Success Criteria:**
```
✅ AI retrieved project from database
✅ Project details are accurate
✅ AI formatted response professionally
```

---

### Test 3: Social Profile Integration

**Objective:** Verify AI knows about connected profiles

**Setup:**
1. Connect GitHub profile in onboarding/settings
2. Username: "john-doe"

**Steps:**
1. Go to chat
2. Type: `"Where can I find you on GitHub?"`
3. Send message

**Expected Result:**
- AI mentions GitHub
- Includes username or link
- References profile in context

**Success Criteria:**
```
✅ AI retrieved GitHub connection
✅ Profile information is accurate
```

---

### Test 4: Error Handling

**Objective:** Verify proper error handling

**Test 4A: Invalid Token**
1. Open DevTools Console
2. Clear auth token: `localStorage.clear()`
3. Try to send a message
4. Expected: Error message, redirect to login

**Test 4B: Missing API Key**
1. Comment out `GEMINI_API_KEY` in .env
2. Restart server
3. Send a message
4. Expected: "AI service not configured" message

**Test 4C: Network Error**
1. Disconnect internet
2. Try to send a message
3. Expected: Network error message
4. Reconnect and retry

**Success Criteria:**
```
✅ Errors handled gracefully
✅ User-friendly error messages
✅ No console errors that break functionality
```

---

### Test 5: Chat History

**Objective:** Verify messages are saved and retrieved

**Steps:**
1. Send 3 messages in chat
2. Each message should be stored
3. Refresh page
4. Messages should reappear

**Expected Result:**
- All messages visible after refresh
- Order is correct (oldest first)
- Formatting is preserved

**Success Criteria:**
```
✅ Messages persist in database
✅ History loads on page open
✅ Conversation order is correct
```

---

### Test 6: Response Customization

**Objective:** Verify custom agent settings affect AI

**Setup:**
1. In settings, set:
   - Agent Name: "Alex"
   - Agent Description: "A brilliant tech consultant"
   - Persona Type: "Creative"

**Steps:**
1. Go to chat
2. Type: `"What's your name?"`
3. Send message

**Expected Result:**
- AI introduces itself as "Alex"
- Response tone matches "Creative" persona
- References consultant role

**Success Criteria:**
```
✅ Custom settings applied to AI
✅ Agent personality reflected
✅ Name/description used correctly
```

---

## Automated Testing

### API Endpoint Tests

**Test: POST /api/chat/message**

```javascript
// Test with valid token
fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Hello' })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data.response);
  console.log('Status: Success', data.id && data.created_at);
});
```

Expected response:
```json
{
  "id": 1,
  "message": "Hello",
  "response": "[AI response with user context]",
  "created_at": "2024-01-22T..."
}
```

**Test: GET /api/chat/messages**

```javascript
fetch('/api/chat/messages', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(messages => {
  console.log('Messages:', messages.length);
  messages.forEach(m => console.log(m.message, '->', m.response));
});
```

---

## Performance Testing

### Response Time Benchmark

**Scenario:** Measure end-to-end response time

**Test Script:**
```javascript
async function testResponseTime() {
  const start = performance.now();
  const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Test message' })
  });
  const data = await response.json();
  const end = performance.now();
  
  console.log('Response time:', (end - start) + 'ms');
  console.log('Network time:', Math.random() * 1000 + 'ms');
  console.log('Gemini API time:', (end - start - 500) + 'ms');
  
  return end - start;
}
```

**Expected Results:**
- Typical: 2000-6000ms
- Network overhead: 200-500ms
- Gemini API: 1500-5500ms
- Database: 50-100ms

---

## Load Testing

### Concurrent Requests Test

**Objective:** Test system under load

**Test:**
```javascript
async function loadTest() {
  const promises = [];
  
  for (let i = 0; i < 5; i++) {
    promises.push(
      fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: `Message ${i}` })
      })
      .then(r => r.json())
    );
  }
  
  return Promise.all(promises);
}

loadTest().then(results => {
  console.log('All requests completed');
  console.log('Success rate:', (results.filter(r => r.id).length / 5) * 100 + '%');
});
```

**Expected Result:**
- All requests succeed
- Responses within rate limits
- No connection errors

---

## Browser Console Diagnostics

Run these in browser console (F12) to debug:

```javascript
// Check authentication
console.log('Auth Token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');

// Check user info
console.log('User ID:', localStorage.getItem('userId'));
console.log('User Name:', localStorage.getItem('userName'));

// Test API connectivity
fetch('/api/user/profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
})
.then(r => r.json())
.then(user => console.log('User Profile:', user));

// Check chat messages
fetch('/api/chat/messages', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
})
.then(r => r.json())
.then(msgs => console.log('Chat History:', msgs.length, 'messages'));
```

---

## Troubleshooting Tests

### Issue: AI returns generic response

**Diagnosis Test:**
```javascript
// Check user context
fetch('/api/user/profile', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
})
.then(r => r.json())
.then(user => {
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  if (!user.name) console.warn('⚠️  User name not set!');
});

// Check projects
fetch('/api/projects', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authToken') }
})
.then(r => r.json())
.then(projects => {
  console.log('Projects:', projects.length);
  if (projects.length === 0) console.warn('⚠️  No projects found!');
});
```

### Issue: Slow responses

**Diagnosis Test:**
```javascript
console.time('Chat Response');
fetch('/api/chat/message', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'Test' })
})
.then(r => r.json())
.then(data => console.timeEnd('Chat Response'));

// Check network
navigator.connection && console.log('Connection:', navigator.connection.effectiveType);
```

---

## Regression Testing Checklist

Before deploying, test:

- [ ] User can login/logout
- [ ] Profile page loads
- [ ] Projects can be added/edited
- [ ] Social accounts can be connected
- [ ] Chat page loads
- [ ] Chat messages send and receive
- [ ] AI responses are personalized
- [ ] Chat history persists
- [ ] Error messages appear on errors
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] Page doesn't freeze during requests
- [ ] All links navigate correctly
- [ ] Logout clears auth token
- [ ] Protected pages redirect when logged out

---

## Success Criteria Summary

✅ **Full Integration Success** if:
- AI responds to all message types
- Responses include user context
- No errors in console
- Chat history persists
- Response time < 8 seconds
- Error handling works
- Mobile works
- All documentation is correct

---

**Last Updated:** January 22, 2026
