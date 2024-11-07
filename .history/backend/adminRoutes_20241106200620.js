const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming db connection is in db.js

// Fetch Courses API
router.get('/courses', (req, res) => {
  const query = 'SELECT * FROM courses';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ message: 'Error fetching courses' });
    }
    res.status(200).json(result);
  });
});

// Update Course Enable/Disable Status API
router.post('/update-course', (req, res) => {
  const { id, enabled } = req.body;
  const query = 'UPDATE courses SET enabled = ? WHERE id = ?';
  
  db.query(query, [enabled, id], (err, result) => {
    if (err) {
      console.error('Error updating course:', err);
      return res.status(500).json({ message: 'Error updating course' });
    }
    res.status(200).json({ message: 'Course updated successfully' });
  });
});

module.exports = router;
