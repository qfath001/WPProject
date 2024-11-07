const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming the DB connection is in db.js

// Middleware to verify if the student is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && !req.session.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
};

// Route to get the advising history for the logged-in student
router.get('/advising-history', isAuthenticated, (req, res) => {
  // Log the session to check if it persists
  console.log('Session details:', req.session);

  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const email = req.session.user.email;

  const query = `
    SELECT date_submitted AS date, term, status 
    FROM advising_history 
    WHERE student_email = ?
    ORDER BY date_submitted DESC
  `;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error fetching advising history:', err);
      return res.status(500).json({ message: 'Error fetching advising history' });
    }

    if (result.length === 0) {
      return res.status(200).json([]); // Return empty array if no history
    }

    res.status(200).json(result); // Return advising history
  });
});

module.exports = router;
