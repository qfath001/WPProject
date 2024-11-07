const express = require('express');
const db = require('./db'); // Ensure we are connecting to the existing database
const router = express.Router(); // Use express Router for modularization
const { verifyAdmin } = require('./middleware'); // Importing the middleware
// Check if the middleware is undefined
console.log('verifyAdmin:', verifyAdmin);

// Route to fetch prerequisite courses between levels 100 and 499
router.get('/prerequisites', verifyAdmin, (req, res) => {
  const query = 'SELECT * FROM courses WHERE level BETWEEN 100 AND 499';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ message: 'Error fetching courses' });
    }

    res.status(200).json(results);
  });
});

// Route to update the status of a prerequisite course (enable/disable)
router.post('/prerequisites/update', verifyAdmin, (req, res) => {
  const { courseId, enabled } = req.body;

  if (!courseId || enabled === undefined) {
    return res.status(400).json({ message: 'Missing courseId or enabled status' });
  }

  const query = 'UPDATE courses SET enabled = ? WHERE id = ?';

  db.query(query, [enabled, courseId], (err, result) => {
    if (err) {
      console.error('Error updating course status:', err);
      return res.status(500).json({ message: 'Error updating course status' });
    }

    res.status(200).json({ message: 'Course status updated successfully' });
  });
});

module.exports = router;
