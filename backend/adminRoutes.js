const express = require('express');
const router = express.Router();
const db = require('./db'); // Assuming db connection is in db.js
const transporter = require('./server'); // Importing the transporter

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

// Fetch all advising sheets for admin
router.get('/advising-sheets', (req, res) => {
  const query = `
    SELECT ah.id, u.firstName, u.lastName, u.uin, ah.term, ah.status, ah.student_email
    FROM advising_history ah
    JOIN users u ON ah.student_email = u.email
    ORDER BY ah.date_submitted DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching advising sheets:', err);
      return res.status(500).json({ message: 'Error fetching advising sheets' });
    }
    res.json(results);
  });
});

// Fetch a specific advising sheet by ID
router.get('/advising-sheet/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT ah.*, u.firstName, u.lastName, u.uin
    FROM advising_history ah
    JOIN users u ON ah.student_email = u.email
    WHERE ah.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error fetching advising sheet:', err);
      return res.status(500).json({ message: 'Error fetching advising sheet' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Advising sheet not found' });
    }
    res.json(result[0]);
  });
});

// Update advising sheet status and add admin message
router.put('/advising-sheet/:id', (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  if (!status || !message) {
    return res.status(400).json({ message: 'Status and message are required' });
  }

  const query = `
    UPDATE advising_history SET status = ?, admin_message = ? WHERE id = ?
  `;

  db.query(query, [status, message, id], (err, result) => {
    if (err) {
      console.error('Error updating advising sheet:', err);
      return res.status(500).json({ message: 'Error updating advising sheet' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Advising sheet not found' });
    }

    // Fetch the student's email to send the notification
    const fetchStudentQuery = `
      SELECT student_email, term FROM advising_history WHERE id = ?
    `;
    db.query(fetchStudentQuery, [id], (err, fetchResult) => {
      if (err) {
        console.error('Error fetching student email:', err);
        return res.status(500).json({ message: 'Error fetching student email' });
      }
      if (fetchResult.length === 0) {
        return res.status(404).json({ message: 'Student not found for given advising sheet.' });
      }

      const { student_email, term } = fetchResult[0];

      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student_email,
        subject: `Advising Decision for Term ${term}`,
        text: `Your advisor has ${status.toLowerCase()} your Course Advising Form for the term ${term}.\n\nAdmin Message: ${message}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Advising sheet updated, but failed to send email notification.' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Advising sheet updated and email sent successfully' });
      });
    });
  });
});

module.exports = router;
