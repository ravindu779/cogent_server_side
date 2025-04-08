const express = require('express');
const Registration = require('../models/Registration');
const router = express.Router();

// Submit registration form
router.post('/', (req, res) => {
  Registration.create(req.body, (err, result) => {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ 
          success: false,
          message: 'This email is already registered'
        });
      }
      return res.status(500).json({ 
        success: false,
        message: 'Database error'
      });
    }
    res.status(201).json({ 
      success: true,
      data: result,
      message: 'Registration submitted successfully!'
    });
  });
});

// Get all registrations (for admin view)
router.get('/', (req, res) => {
  Registration.findAll((err, registrations) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        message: 'Database error'
      });
    }
    res.json({ 
      success: true,
      data: registrations
    });
  });
});

module.exports = router;