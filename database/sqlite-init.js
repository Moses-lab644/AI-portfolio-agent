// Lightweight SQLite fallback for local dev (no Postgres required)
const Database = require('better-sqlite3');
const path = require('path');

// Use in-memory DB for tests, file-based for dev
const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, '../dev.db');
const db = new Database(dbPath);

// Simple pool-like interface for compatibility
const pool = {
  query: async (sql, params = []) => {
    try {
      // Convert Postgres placeholders ($1, $2) to SQLite (?)
      let stmt = sql.replace(/\$\d+/g, '?');
      
      // Handle SERIAL PRIMARY KEY (SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT)
      stmt = stmt.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
      
      // Handle JSONB -> JSON
      stmt = stmt.replace(/JSONB/g, 'JSON');
      
      // Handle CURRENT_TIMESTAMP
      stmt = stmt.replace(/CURRENT_TIMESTAMP/g, "CURRENT_TIMESTAMP");
      
      // Handle REFERENCES constraints (simplified for SQLite)
      if (stmt.includes('REFERENCES')) {
        // Keep as is; SQLite supports FOREIGN KEY constraints if enabled
      }

      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const rows = db.prepare(stmt).all(...params);
        return { rows };
      } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const result = db.prepare(stmt).run(...params);
        return { rows: [{ id: result.lastInsertRowid }] };
      } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
        const result = db.prepare(stmt).run(...params);
        return { rows: [], changes: result.changes };
      } else if (sql.trim().toUpperCase().startsWith('CREATE TABLE')) {
        db.exec(stmt);
        return { rows: [] };
      } else {
        const result = db.prepare(stmt).run(...params);
        return { rows: [] };
      }
    } catch (error) {
      console.error('SQLite query error:', error.message);
      throw error;
    }
  }
};

const initDatabase = async () => {
  try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Users table
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chat messages table
    db.exec(`CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Portfolio connections table
    db.exec(`CREATE TABLE IF NOT EXISTS portfolio_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      platform TEXT NOT NULL,
      connected INTEGER DEFAULT 0,
      username TEXT,
      profile_url TEXT,
      access_token TEXT,
      data JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    )`);

    // Social connections table
    db.exec(`CREATE TABLE IF NOT EXISTS social_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      platform TEXT NOT NULL,
      username TEXT,
      profile_url TEXT,
      profile_data JSON,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    )`);

    // User settings table
    db.exec(`CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      persona_type TEXT DEFAULT 'professional',
      agent_name TEXT,
      agent_description TEXT,
      public_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects table
    db.exec(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      project_url TEXT,
      technologies TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Password resets table
    db.exec(`CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
  }
};

module.exports = { pool, initDatabase, db };
