const db = require('../db/database');

class Registration {
  static create(registrationData, callback) {
    const { name, email, company, jobTitle, phone, message } = registrationData;
    
    db.run(
      `INSERT INTO registrations (name, email, company, jobTitle, phone, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, company, jobTitle, phone, message],
      function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID });
      }
    );
  }

  static findAll(callback) {
    db.all('SELECT * FROM registrations ORDER BY createdAt DESC', [], (err, rows) => {
      if (err) return callback(err);
      callback(null, rows);
    });
  }
}

module.exports = Registration;