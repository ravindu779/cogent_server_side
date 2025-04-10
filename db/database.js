const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the db directory exists
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'registrations.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('Attempted to open database at:', dbPath);
    throw err; // Crash the app if DB fails (good for debugging)
  }
  console.log(`Connected to SQLite database at ${dbPath}`);
  initializeDatabase();
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL,
      jobTitle TEXT,
      phone TEXT,
      message TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Table creation error:', err.message);
      throw err;
    }
    console.log('Registrations table ready');
  });
}

module.exports = db;