# AI-Powered Portfolio Agent

A modern web application that allows professionals to create AI-powered portfolio agents by connecting their digital footprint from various platforms.

## Features

- **User Authentication**: JWT-based auth with Google/GitHub OAuth
- **Social Media Integration**: Connect GitHub, LinkedIn, Dribbble, Medium
- **AI Chat Interface**: Interactive portfolio agent for visitors
- **Responsive Design**: Works on all devices
- **Profile Management**: Customizable user profiles
- **Real-time Chat**: Persistent chat messages

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, Passport.js
- **File Upload**: Multer

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- PostgreSQL database
- Google/GitHub OAuth credentials (optional)

### Installation

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Database Setup**:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string

3. **Environment Variables**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-session-secret
```

4. **Run the application**:
```bash
npm start
```

Visit `http://localhost:3000` to access the application.

## Production Deployment

### Recommended Hosting Platforms:
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Heroku**: With Heroku Postgres add-on
- **Vercel**: With Supabase PostgreSQL
- **AWS**: EC2 + RDS PostgreSQL

### Environment Setup:
1. Set `NODE_ENV=production`
2. Use production PostgreSQL database
3. Configure OAuth redirect URLs for production domain
4. Set secure JWT and session secrets

## Database Migration

The app automatically creates tables on startup. For production:
1. Run database migrations manually
2. Set up proper database backups
3. Configure connection pooling

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `POST /api/portfolio/connect/:platform` - Connect social platform
- `GET /api/portfolio/connections` - Get user connections
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/messages` - Get chat history
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## File Structure

```
├── database/
│   └── init.js              # PostgreSQL database setup
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── portfolio.js         # Social platform connections
│   ├── chat.js              # Chat functionality
│   └── user.js              # User profile management
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── uploads/                 # File upload directory
├── *.html                   # Frontend pages
├── server.js                # Express server
├── package.json             # Dependencies
└── .env.example             # Environment template
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- SQL injection prevention with parameterized queries
- File upload restrictions

## License

This project is provided as-is for educational and prototyping purposes.