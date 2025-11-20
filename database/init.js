const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDatabase = async () => {
  try {
    // Users table
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chat messages table
    await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Portfolio connections table
    await pool.query(`CREATE TABLE IF NOT EXISTS portfolio_connections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      platform VARCHAR(50) NOT NULL,
      connected BOOLEAN DEFAULT FALSE,
      username VARCHAR(255),
      profile_url TEXT,
      access_token TEXT,
      data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    )`);

    // Social connections table
    await pool.query(`CREATE TABLE IF NOT EXISTS social_connections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      platform VARCHAR(50) NOT NULL,
      username VARCHAR(255),
      profile_url TEXT,
      profile_data JSONB,
      connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    )`);

    // User settings table
    await pool.query(`CREATE TABLE IF NOT EXISTS user_settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      persona_type VARCHAR(50) DEFAULT 'professional',
      agent_name VARCHAR(255),
      agent_description TEXT,
      public_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects table
    await pool.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      project_url TEXT,
      technologies TEXT,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating database tables:', error);
  }
};

module.exports = { pool, initDatabase };