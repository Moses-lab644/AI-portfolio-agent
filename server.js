const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const projectRoutes = require('./routes/projects');
const settingsRoutes = require('./routes/settings');
const { initDatabase } = require('./database/init');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Initialize database
initDatabase().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', authenticateToken, portfolioRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);

// Protected pages middleware
const requireAuth = (req, res, next) => {
  const protectedPages = ['/onboarding.html', '/dashboard.html', '/chat.html'];
  if (protectedPages.includes(req.path)) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.redirect('/login.html');
    }
    
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      jwt.verify(token, JWT_SECRET);
      next();
    } catch (error) {
      return res.redirect('/login.html');
    }
  } else {
    next();
  }
};

// Apply auth middleware to static files
app.use(requireAuth);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Redirect root to login if not authenticated
app.get('/app', (req, res) => {
  res.redirect('/login.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 