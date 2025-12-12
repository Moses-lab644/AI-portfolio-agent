const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { pool } = require('../database/init');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const crypto = require('crypto');

// Passport configuration
// Determine callback URLs from env (use full URL for OAuth providers)
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${BASE_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return done(null, userResult.rows[0]);
    } else {
      const insertResult = await pool.query('INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id', [email, name]);
      return done(null, { id: insertResult.rows[0].id, email, name });
    }
  } catch (error) {
    return done(error);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
  callbackURL: process.env.GITHUB_CALLBACK_URL || `${BASE_URL}/api/auth/github/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName || profile.username;
    
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      return done(null, userResult.rows[0]);
    } else {
      const insertResult = await pool.query('INSERT INTO users (email, name) VALUES ($1, $2) RETURNING id', [email, name]);
      return done(null, { id: insertResult.rows[0].id, email, name });
    }
  } catch (error) {
    return done(error);
  }
}));

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET, { expiresIn: '7d' });
    // Return token so client can redirect to dashboard with token in URL (like OAuth)
    res.json({ token, userId: result.rows[0].id, name, redirectUrl: '/dashboard.html' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Signup alias for register
router.post('/signup', async (req, res) => {
  // Redirect to register endpoint
  req.url = '/register';
  return router.handle(req, res);
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, userId: decoded.userId });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/onboarding.html?token=${token}`);
});

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
  const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.redirect(`/onboarding.html?token=${token}`);
});

// Forgot password - request reset
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      // Do not reveal whether email exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const userId = userRes.rows[0].id;
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await pool.query('INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)', [userId, token, expiresAt]);

    // TODO: send email with reset link. For dev, return token in response.
    const resetLink = `${process.env.BASE_URL || ('http://localhost:' + (process.env.PORT || 3000))}/reset.html?token=${token}`;
    return res.json({ success: true, message: 'Password reset initiated', resetLink });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Reset password using token
router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const resetRes = await pool.query('SELECT * FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()', [token]);
    if (resetRes.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });

    const row = resetRes.rows[0];
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, row.user_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [row.id]);

    return res.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;