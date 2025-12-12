require('dotenv').config();

let pool;
let initDatabase;
let dbType = 'postgres';

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// Helper that creates the tables for Postgres
const createPostgresTables = async (pgPool) => {
  // Users table
  await pgPool.query(`CREATE TABLE IF NOT EXISTS users (
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
  await pgPool.query(`CREATE TABLE IF NOT EXISTS portfolio_connections (
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
  await pgPool.query(`CREATE TABLE IF NOT EXISTS social_connections (
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
  await pgPool.query(`CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    persona_type VARCHAR(50) DEFAULT 'professional',
    agent_name VARCHAR(255),
    agent_description TEXT,
    public_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  // Projects table
  await pgPool.query(`CREATE TABLE IF NOT EXISTS projects (
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

  // Password resets table
  await pgPool.query(`CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
};

// If user explicitly forces SQLite via env var, use it and return early
const forceSqlite = (process.env.FORCE_SQLITE === 'true') || (process.env.USE_FORCE_SQLITE === 'true');
if (forceSqlite) {
  console.log('ℹ️ FORCE_SQLITE is set — using SQLite for development as requested.');
  const sqliteModule = require('./sqlite-init');
  pool = sqliteModule.pool;
  initDatabase = sqliteModule.initDatabase;
  dbType = 'sqlite';
  module.exports = { pool, initDatabase, dbType };
  return;
}

// Try to use Postgres first (recommended for your learning).
try {
  const { Pool } = require('pg');
  // Allow a default local fallback connection string when DATABASE_URL is missing
  const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres';
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // initDatabase will ensure Postgres is reachable and then create tables
  initDatabase = async () => {
    const maxRetries = 6;
    const baseDelay = 2000; // ms
    let lastErr;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // quick health check
        await pool.query('SELECT 1');
        // create tables
        await createPostgresTables(pool);
        console.log('✅ Postgres connected and tables are ready');
        return;
      } catch (err) {
        lastErr = err;
        const waitMs = baseDelay * attempt;
        console.warn(`Attempt ${attempt}/${maxRetries} — Postgres not ready: ${err.message || err}. Retrying in ${waitMs}ms...`);
        // On last attempt, break and throw
        if (attempt === maxRetries) break;
        await wait(waitMs);
      }
    }

    // After retries failed, exit with actionable guidance.
    console.error('\n✖ Unable to connect to Postgres after multiple attempts.');
    console.error('Check your DATABASE_URL credentials and ensure the database/user exist.');
    console.error('Helpful steps:');
    console.error('1. Verify Postgres is running: Test-NetConnection -ComputerName localhost -Port 5432');
    console.error('2. Check DATABASE_URL in .env (default: postgresql://username:password@localhost:5432/portfolio_db)');
    console.error('3. Ensure the database and user exist (run: node scripts/create_db.js "<superuser_url>" portfolio_db username password)');
    console.error('4. To connect to Postgres as superuser without password, try:');
    console.error('   & "C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe" -U postgres -h localhost -p 5432 -w');
    console.error('5. Inside psql, you can set a password: ALTER ROLE postgres WITH PASSWORD \'newpass\';');
    console.error('6. Or temporarily edit pg_hba.conf to use "trust" auth, restart Postgres, then set passwords.');
    console.error('\nLast Postgres connection error:', lastErr.message || lastErr);
    process.exit(1);
  };
} catch (err) {
  // If `pg` isn't available, show a clear message explaining how to install and continue.
  console.error("Required module 'pg' is not installed or failed to load.\nInstall dependencies with `npm install` or run `npm install pg`.");
  console.error('If you prefer SQLite for now, set: FORCE_SQLITE=true');
  // Provide a safe stub to avoid runtime crashes downstream, but prefer explicit install
  pool = {
    query: async () => ({ rows: [] }),
  };
  initDatabase = async () => {
    console.warn('initDatabase skipped because Postgres client is unavailable. Install `pg` to enable DB features.');
  };
  dbType = 'stub';
}

module.exports = { pool, initDatabase, dbType };