# Gemini AI Integration - Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT SIDE (Browser)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Chat Interface                         │  │
│  │  - Message Input                                          │  │
│  │  - Message Display                                        │  │
│  │  - Loading Indicator                                      │  │
│  │  - Error Handling                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↕ (HTTP/JSON with JWT Token)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             POST /api/chat/message                        │  │
│  │  1. Validate JWT Token                                    │  │
│  │  2. Validate Message Input                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         getUserContext(userId)                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Database Queries (Parallel)                         │ │  │
│  │  ├─ users table → name, email                          │ │  │
│  │  ├─ projects table → title, description, tech          │ │  │
│  │  ├─ user_settings → persona, agent_name, desc          │ │  │
│  │  └─ social_connections → platform, username, url       │ │  │
│  │  Returns: {name, email, projects[], connections[]}     │ │  │
│  │  Time: ~50-100ms                                        │ │  │
│  └─────────────────────────────────────────────────────────┘ │  │
│           ↓                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │      generateGeminiResponse(message, context)            │  │
│  │  1. Build System Prompt with user data                   │  │
│  │  2. Prepare API request                                  │  │
│  │  3. Call Gemini API                                      │  │
│  │  4. Parse Response                                       │  │
│  │  Time: ~2000-6000ms                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │      Store in Database                                   │  │
│  │  INSERT chat_messages (user_id, message, response)       │  │
│  │  Time: ~10-20ms                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│           ↓                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │      Return JSON Response                                │  │
│  │  {id, message, response, created_at}                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE GEMINI API                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Model: gemini-pro                                         │  │
│  │ ├─ Receives system prompt + user message                 │  │
│  │ ├─ Processes context                                     │  │
│  │ ├─ Generates response                                    │  │
│  │ └─ Applies safety filters                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
USER SENDS MESSAGE
        ↓
    [chat.html]
    - Validate input
    - Show loading
        ↓
    [POST /api/chat/message]
    - Headers: Authorization: Bearer TOKEN
    - Body: {message: "user input"}
        ↓
    [Backend Validation]
    - Check token
    - Check message
    - Return 400 if invalid
        ↓
    [getUserContext]
    ┌─────────────────────────────────┐
    │ Database Connection             │
    ├─────────────────────────────────┤
    │ Query 1: SELECT * FROM users    │ → {name, email}
    │ Query 2: SELECT * FROM projects │ → [{title, desc, tech}]
    │ Query 3: SELECT * FROM settings │ → {persona, agent_name}
    │ Query 4: SELECT * FROM conns    │ → [{platform, user, url}]
    └─────────────────────────────────┘
        ↓
    [Build System Prompt]
    "You are {agentName}
     Persona: {personaType}
     Name: {userName}
     Projects: {project details}
     Connected: {social profiles}
     ..."
        ↓
    [Gemini API Request]
    https://generativelanguage.googleapis.com/...
    Headers: {Authorization: Bearer GEMINI_API_KEY}
    Body: {
      contents: [{parts: [{text: system_prompt + user_message}]}],
      generationConfig: {...},
      safetySettings: [...]
    }
        ↓
    [Gemini Processes]
    - Parse prompt
    - Understand context
    - Generate response
    - Apply filters
        ↓
    [Gemini Response]
    {
      candidates: [{
        content: {
          parts: [{text: "AI response"}]
        }
      }]
    }
        ↓
    [Store Response]
    INSERT INTO chat_messages
        ↓
    [Return to Client]
    {
      id: 123,
      message: "user input",
      response: "AI response",
      created_at: "2024-01-22T..."
    }
        ↓
    [Display in Chat]
    - Remove loading
    - Add message bubble
    - Scroll to bottom
    - Save to history
```

## Request/Response Timeline

```
Time    Component              Activity
────────────────────────────────────────────────────────────────
0ms     User                   Types message and clicks Send
        ├─ Input validation
        └─ Show loading UI

50ms    Client → Server        HTTP POST request

100ms   Server                 Validates JWT token
        └─ Returns 401 if invalid

150ms   Server → Database      Starts 4 parallel queries

200ms   Database               Queries execute
        ├─ users (10ms)
        ├─ projects (20ms)
        ├─ user_settings (15ms)
        └─ social_connections (20ms)

250ms   Server                 Builds system prompt
        └─ Combines all data

300ms   Server → Gemini API    Sends API request
        └─ Includes all context

2800ms  Gemini                 Processing
        ├─ Tokenization
        ├─ Context understanding
        ├─ Response generation
        └─ Content filtering

2800ms  Server ← Gemini        Receives response

2850ms  Server                 Parses Gemini response
        └─ Extracts text

2900ms  Server → Database      INSERT chat_messages

2920ms  Server → Client        Return JSON response

2970ms  Client                 Display response
        ├─ Remove loading
        ├─ Add message
        ├─ Scroll down
        └─ Save to history

3000ms  User                   Message displayed
────────────────────────────────────────────────────────────────
TOTAL TIME: ~3 seconds (typical, range 2-6 seconds)
```

## Database Schema

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email               │
│ name                │
│ password (hashed)   │
│ created_at          │
└─────────────────────┘
         ↑ 1
         │
         │ n
┌────────────────────────────┐
│   user_settings            │
├────────────────────────────┤
│ id (PK)                    │
│ user_id (FK)               │
│ persona_type               │
│ agent_name                 │
│ agent_description          │
└────────────────────────────┘

         ↑
         │
         │ n users has many of
         │
    ┌────────────────────────────┐
    │   projects                 │
    ├────────────────────────────┤
    │ id (PK)                    │
    │ user_id (FK)               │
    │ title                      │
    │ description                │
    │ technologies               │
    └────────────────────────────┘

         ↑
         │
         │ n users has many of
         │
┌────────────────────────────────────┐
│   social_connections               │
├────────────────────────────────────┤
│ id (PK)                            │
│ user_id (FK)                       │
│ platform (github, linkedin, etc)   │
│ username                           │
│ profile_url                        │
└────────────────────────────────────┘

         ↑
         │
         │ n users has many of
         │
┌────────────────────────────────────┐
│   chat_messages                    │
├────────────────────────────────────┤
│ id (PK)                            │
│ user_id (FK)                       │
│ message (user input)               │
│ response (AI response)             │
│ created_at                         │
└────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────────┐
│   User Submits   │
│   Credentials    │
└──────┬───────────┘
       ↓
┌──────────────────────────────────┐
│  POST /api/auth/login            │
│  {email, password}               │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Database: SELECT * FROM users   │
│  WHERE email = ?                 │
└──────┬───────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  bcrypt.compare(password,        │
│  hashed_password)                │
└──────┬───────────────────────────┘
       ↓
   ┌───┴────┐
   │         │
 ✓ │       ✗ │
   ↓         ↓
[Valid]   [Invalid]
   │         │
   ↓         ↓
jwt.sign  Return 400
   │         
   ↓         
{token}   
   │
   ↓
┌──────────────────────────┐
│ Client stores token in   │
│ localStorage             │
│ authToken = "jwt..."     │
└──────┬───────────────────┘
       ↓
┌──────────────────────────────────┐
│  All protected API calls include: │
│  Authorization: Bearer {token}   │
└──────────────────────────────────┘
```

## Chat System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Chat.html (Frontend)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  User Types Message                              │ │
│  │  "Tell me about your projects"                   │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  JavaScript Event Handler                        │ │
│  │  - Validate message (not empty)                  │ │
│  │  - Show loading indicator                        │ │
│  │  - Display user message in chat                  │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Fetch API Call                                  │ │
│  │  POST /api/chat/message                          │ │
│  │  Headers: {Authorization: Bearer TOKEN}          │ │
│  │  Body: {message: "..."}                          │ │
│  └──────────┬───────────────────────────────────────┘ │
└─────────────┼──────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────────┐
│              Routes/Chat.js (Backend)                  │
│  ┌──────────────────────────────────────────────────┐ │
│  │  POST /api/chat/message Handler                  │ │
│  │  1. Extract userId from JWT                      │ │
│  │  2. Extract message from body                    │ │
│  │  3. Validate: message not empty                  │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  getUserContext(userId)                          │ │
│  │  - Query: users (SELECT name, email)             │ │
│  │  - Query: projects (SELECT title, desc, tech)    │ │
│  │  - Query: user_settings (persona, name)          │ │
│  │  - Query: social_connections (platform, user)    │ │
│  │  - Combine into context object                   │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  generateGeminiResponse(message, context)        │ │
│  │  1. Build system prompt with context             │ │
│  │  2. Create API request to Gemini                 │ │
│  │  3. Include safety settings & config             │ │
│  │  4. Parse Gemini response                        │ │
│  │  5. Return response text                         │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Database: INSERT chat_messages                  │ │
│  │  - Store userId                                  │ │
│  │  - Store user message                            │ │
│  │  - Store AI response                             │ │
│  │  - Store timestamp                               │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Return JSON Response                            │ │
│  │  {id, message, response, created_at}             │ │
│  └──────────┬───────────────────────────────────────┘ │
└─────────────┼──────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────────┐
│                   Chat.html (Frontend)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Receive Response JSON                           │ │
│  │  {response: "Based on my projects..."}           │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Update DOM                                      │ │
│  │  - Remove loading indicator                      │ │
│  │  - Create AI message bubble                      │ │
│  │  - Add to chat container                         │ │
│  │  - Scroll to bottom                              │ │
│  └──────────┬───────────────────────────────────────┘ │
│             ↓                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Display Complete Conversation                   │ │
│  │  User: "Tell me about your projects"             │ │
│  │  AI:   "Based on my projects..."                 │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
User Sends Message
        ↓
Validate Input
    ├─ Empty?      → Return 400 "Message cannot be empty"
    └─ Valid       → Continue
        ↓
Check Authentication
    ├─ No token?    → Return 401 "No token provided"
    ├─ Invalid?     → Return 403 "Invalid token"
    └─ Valid        → Continue
        ↓
Fetch User Context
    ├─ DB Error?    → Use defaults, continue
    └─ Success      → Continue
        ↓
Call Gemini API
    ├─ No API Key?  → Return "AI service not configured"
    ├─ Rate limit?  → Return "Please try again later"
    ├─ Network?     → Return "I'm having trouble..."
    ├─ Timeout?     → Return "Request took too long"
    └─ Success      → Continue
        ↓
Store Response
    ├─ DB Error?    → Log error, still return response
    └─ Success      → Continue
        ↓
Return Response
        ↓
Display to User
```

---

These diagrams help visualize how the Gemini integration works at different levels:
- **System Architecture** shows the overall components
- **Data Flow** shows how information moves through the system
- **Timeline** shows when things happen
- **Schema** shows database structure
- **Chat Architecture** shows the complete chat flow

Refer to these when debugging or understanding the integration!
