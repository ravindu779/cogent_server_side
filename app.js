require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Initialize Express app
const app = express();

// Database Configuration
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'registrations.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(' Database connection error:', err.message);
    process.exit(1);
  }
  console.log(' Connected to SQLite database');
});

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite default
    'http://localhost:3000'  // Create React App default
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='registrations'", (err, row) => {
    if (err || !row) {
      return res.status(500).json({ 
        status: 'DOWN',
        database: err ? err.message : 'Registrations table not found'
      });
    }
    res.json({ 
      status: 'UP',
      database: 'Connected',
      tables: ['registrations']
    });
  });
});

// API Routes
const registrationsRouter = require('./routes/registrations');
app.use('/api/registrations', registrationsRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(' Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Server Startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    db.close();
    console.log(' Server closed. Database connection closed.');
    process.exit(0);
  });
});

module.exports = app;