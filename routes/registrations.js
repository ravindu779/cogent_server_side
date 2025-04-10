const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { body, validationResult } = require('express-validator');

// Input Validation Rules
const registrationValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('jobTitle').optional().trim(),
  body('phone').optional().trim(),
  body('message').optional().trim()
];

// Create New Registration
router.post('/', registrationValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { name, email, company, jobTitle, phone, message } = req.body;

  try {
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO registrations 
        (name, email, company, jobTitle, phone, message) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, company, jobTitle, phone, message],
        function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
              reject(new Error('Email already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.id,
        name,
        email,
        company
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Database operation failed'
    });
  }
});

// Get All Registrations (for testing)
router.get('/', async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM registrations', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

module.exports = router;