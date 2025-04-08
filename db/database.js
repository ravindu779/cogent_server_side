const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file will be created at server/db/registrations.db
const dbPath = path.join(__dirname, 'registrations.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      company TEXT NOT NULL,
      jobTitle TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Table creation error:', err.message);
    } else {
      console.log('Registrations table ready');
    }
  });
}

module.exports = db;