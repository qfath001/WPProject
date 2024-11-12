const express = require('express');
const db = require('./db'); // Your existing database connection
const router = express.Router();
const { isAuthenticated } = require('./middleware'); // Ensure only authenticated users can submit

// POST route to handle form submission
// POST route to handle form submission
router.post('/submit-advising', isAuthenticated, (req, res) => {
  const { lastTerm, lastGPA, advisingTerm, prerequisites, coursePlan } = req.body;
  const studentEmail = req.session.user?.email;

  if (!studentEmail) {
    console.log('No email found in session');
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  console.log('Inserting advising history for:', studentEmail);

  // Check if the advising form for the given term already exists
  const checkExistingAdvisingTermQuery = `
    SELECT * FROM advising_history 
    WHERE student_email = ? AND term = ? 
  `;
  db.query(checkExistingAdvisingTermQuery, [studentEmail, advisingTerm], (err, existingRecords) => {
    if (err) {
      console.error('Error checking existing advising terms:', err);
      return res.status(500).json({ message: 'Server error while checking existing advising terms' });
    }

    // If a record already exists for this term, return an error
    if (existingRecords.length > 0) {
      return res.status(400).json({ message: `Advising form for "${advisingTerm}" has already been submitted.` });
    }

    // Get the list of course names being submitted in the new advising form
    const courseNames = coursePlan.map(course => course.courseName.trim().toLowerCase());

    // Check if any of these courses have already been taken in previous terms
    const checkPreviouslyTakenCoursesQuery = `
      SELECT DISTINCT LOWER(course_name) AS course_name FROM course_plan 
      WHERE advising_history_id IN (
        SELECT id FROM advising_history WHERE student_email = ? AND term != ?
      ) AND LOWER(course_name) IN (${courseNames.map(() => '?').join(',')})
    `;
    db.query(checkPreviouslyTakenCoursesQuery, [studentEmail, advisingTerm, ...courseNames], (err, previouslyTakenCourses) => {
      if (err) {
        console.error('Error checking previously taken courses:', err);
        return res.status(500).json({ message: 'Server error while checking previously taken courses' });
      }

      if (previouslyTakenCourses.length > 0) {
        const takenCourses = previouslyTakenCourses.map(course => course.course_name).join(', ');
        return res.status(400).json({
          message: `The following courses have already been taken in previous terms: ${takenCourses}`,
        });
      }

      // Insert new advising history record if checks pass
      const insertAdvisingHistoryQuery = `
        INSERT INTO advising_history (student_email, term, date_submitted, status, last_term, last_gpa, prerequisites, course_plan)
        VALUES (?, ?, NOW(), 'Pending', ?, ?, ?, ?)
      `;
      const prerequisitesJSON = JSON.stringify(prerequisites || []);
      const coursePlanJSON = JSON.stringify(coursePlan || []);

      db.query(
        insertAdvisingHistoryQuery,
        [studentEmail, advisingTerm, lastTerm, lastGPA, prerequisitesJSON, coursePlanJSON],
        (err, result) => {
          if (err) {
            console.error('Error inserting advising history:', err);
            return res.status(500).json({ message: 'Server error while submitting advising form' });
          }

          const advisingHistoryId = result.insertId;

          // Insert course plan into course_plan table
          const insertCoursePlanQuery = `
            INSERT INTO course_plan (advising_history_id, course_level, course_name)
            VALUES ?
          `;
          const coursePlanValues = coursePlan.map(course => [advisingHistoryId, course.level, course.courseName]);

          db.query(insertCoursePlanQuery, [coursePlanValues], (err) => {
            if (err) {
              console.error('Error inserting course plan:', err);
              return res.status(500).json({ message: 'Server error while inserting course plan' });
            }

            // Validate prerequisites structure
            if (!prerequisites.every(prerequisite => prerequisite.level && prerequisite.courseName)) {
              console.error('Invalid prerequisite structure:', prerequisites);
              return res.status(400).json({ message: 'Invalid prerequisite data structure' });
            }

            // Insert prerequisites into prerequisites table
            const insertPrerequisitesQuery = `
              INSERT INTO prerequisites (advising_history_id, course_level, course_name)
              VALUES ?
            `;
            const prerequisitesValues = prerequisites.map(prerequisite => [advisingHistoryId, prerequisite.level, prerequisite.courseName]);

            // Check if prerequisitesValues is not empty before inserting
            if (prerequisitesValues.length > 0) {
              console.log('Inserting prerequisites values:', prerequisitesValues);

              db.query(insertPrerequisitesQuery, [prerequisitesValues], (err) => {
                if (err) {
                  console.error('Error inserting prerequisites:', err);
                  return res.status(500).json({ message: 'Server error while inserting prerequisites' });
                }

                console.log('Prerequisites inserted successfully');
                // Proceed with further actions if needed
              });
            } else {
              console.log('No prerequisites to insert');
            }

            res.status(200).json({ message: 'Advising form submitted successfully', advisingHistoryId });
          });
        }
      );
    });
  });
});

// PUT route to update advising history
router.put('/advising-history/:advisingTerm', isAuthenticated, (req, res) => {
  const advisingTerm = decodeURIComponent(req.params.advisingTerm);
  const studentEmail = req.session.user?.email;
  const { lastTerm, lastGPA, prerequisites, coursePlan } = req.body;

  if (!studentEmail) {
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  const updateQuery = `
    UPDATE advising_history
    SET last_term = ?, last_gpa = ?, prerequisites = ?, course_plan = ?, date_submitted = NOW()
    WHERE student_email = ? AND term = ?
  `;
  const prerequisitesJSON = JSON.stringify(prerequisites || []);
  const coursePlanJSON = JSON.stringify(coursePlan || []);

  db.query(
    updateQuery,
    [lastTerm, lastGPA, prerequisitesJSON, coursePlanJSON, studentEmail, advisingTerm],
    (err, result) => {
      if (err) {
        console.error('Error updating advising history:', err);
        return res.status(500).json({ message: 'Server error while updating advising history' });
      }

      res.status(200).json({ message: 'Advising form updated successfully' });
    }
  );
});

// Other GET routes (course catalog, taken courses, enabled courses, etc.)
router.get('/course-catalog', (req, res) => {
  const query = 'SELECT level, course_name FROM course_catalog WHERE enabled = 1';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching course catalog:', err);
      res.status(500).json({ message: 'Server error while fetching course catalog' });
    } else {
      res.json(results);
    }
  });
});

// Route to fetch previously taken courses
router.get('/taken-courses', isAuthenticated, (req, res) => {
  const studentEmail = req.session.user?.email;
  const currentTerm = req.query.currentTerm; // Get the current term from query params
  const excludeAdvisingHistoryId = req.query.excludeId || null; // Handle excludeId (can be null)

  if (!studentEmail) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  // Conditional query to exclude specific advising history ID if provided
  const query = `
    SELECT DISTINCT cp.course_name FROM course_plan cp
    INNER JOIN advising_history ah ON cp.advising_history_id = ah.id
    WHERE ah.student_email = ? AND LOWER(ah.term) != LOWER(?)
    ${excludeAdvisingHistoryId ? 'AND ah.id != ?' : ''}
  `;

  const params = excludeAdvisingHistoryId ? [studentEmail, currentTerm, excludeAdvisingHistoryId] : [studentEmail, currentTerm];

  db.query(query, params, (err, results) => {
      if (err) {
          console.error('Error fetching taken courses:', err);
          return res.status(500).json({ message: 'Error fetching taken courses' });
      }

      const takenCourses = results.map(row => row.course_name);
      res.json(takenCourses);
  });
});

// Route to fetch enabled prerequisite courses
router.get('/enabled-courses', isAuthenticated, (req, res) => {
  const query = `SELECT level, course_name FROM courses WHERE enabled = 1`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching enabled courses:', err);
      return res.status(500).json({ message: 'Error fetching enabled courses' });
    }
    res.json(results);
  });
});

// Route to fetch a specific advising record based on advising term
router.get('/advising-history/:advisingTerm', isAuthenticated, (req, res) => {
  const advisingTerm = decodeURIComponent(req.params.advisingTerm);
  const studentEmail = req.session.user?.email;

  if (!studentEmail) {
    console.error("Unauthorized: No student email in session");
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  const query = `
    SELECT last_term, last_gpa, prerequisites, course_plan, status 
    FROM advising_history 
    WHERE student_email = ? AND term = ?
  `;

  db.query(query, [studentEmail, advisingTerm], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ message: 'Error fetching advising record' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No record found' });
    }

    const record = results[0];

    try {
      const prerequisites = record.prerequisites ? JSON.parse(record.prerequisites) : [];
      const course_plan = record.course_plan ? JSON.parse(record.course_plan) : [];

      res.status(200).json({
        last_term: record.last_term,
        last_gpa: record.last_gpa,
        prerequisites,
        course_plan,
        status: record.status
      });
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      res.status(500).json({ message: 'Error parsing JSON fields in advising record' });
    }
  });
});

module.exports = router;
