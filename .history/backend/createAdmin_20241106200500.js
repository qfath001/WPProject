const bcrypt = require('bcrypt');
const db = require('./db'); // Assuming you have a db connection in db.js

// Function to create admin user if it doesn't already exist
const createAdminUser = async () => {
  const firstName = 'Quhura'; // Admin first name
  const lastName = 'Fathima'; // Admin last name
  const email = 'quhurafathima56@gmail.com'; // Admin email
  const plainPassword = 'Fatima_q2212'; // Admin plain password

  // Check if the admin already exists
  const checkAdminQuery = 'SELECT * FROM users WHERE email = ? AND is_admin = true';
  db.query(checkAdminQuery, [email], async (err, result) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }

    if (result.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    // If admin doesn't exist, hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert the admin user into the database
    const insertAdminQuery = `
      INSERT INTO users (firstName, lastName, email, password, isVerified, is_admin) 
      VALUES (?, ?, ?, ?, true, true)`;

    db.query(insertAdminQuery, [firstName, lastName, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting admin user:', err);
      } else {
        console.log('Admin user created successfully');
      }
    });
  });
};

module.exports = createAdminUser;
