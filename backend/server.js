require('dotenv').config(); // Load environment variables
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass:', process.env.EMAIL_PASS);

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // For generating OTPs
const nodemailer = require('nodemailer'); // For sending emails
const dns = require('dns'); // For checking email domain MX records
const { promisify } = require('util');  // To use async/await with DNS
const lookupMx = promisify(dns.resolveMx);  // Promisify the MX lookup function
const session = require('express-session');  // Add session package
const MySQLStore = require('express-mysql-session')(session); // Import express-mysql-session
const createAdminUser = require('./createAdmin'); // Import the admin creation script
const adminPrerequisiteRoutes = require('./adminPrerequisite');
const adminRoutes = require('./adminRoutes'); // Path to new file
const { verifyAdmin } = require('./middleware'); // Import your middleware functions
const studentRoutes = require('./studentRoutes'); // To import for student routes
const advisingRoutes = require('./advisingRoutes');
const cookieParser = require('cookie-parser');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://wpproject-frontend.web.app', 'https://wpproject-frontend.firebaseapp.com'], // frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only the necessary methods
  credentials: true // Include credentials if needed
}));

app.use(bodyParser.json());
app.use(cookieParser()); // Add this before the routes

// Configure MySQL session store
const sessionStoreOptions = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};
const sessionStore = new MySQLStore(sessionStoreOptions);

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key', // Use environment variable for the secret
  resave: false,
  saveUninitialized: false,
  store: sessionStore, // Use the MySQL session store
  cookie: { 
    httpOnly: true, // Ensures the cookie is only accessible through HTTP
    secure: true, // Set to true if using HTTPS in production
    maxAge: 1000 * 60 * 60 * 24, // Session valid for 1 day
    sameSite: 'None',
    domain: '.web.app'  
  }
}));

app.use('/admin', adminRoutes); // Mount admin routes under /admin
app.use('/admin', adminPrerequisiteRoutes); // Mount the admin routes under /admin
app.use('/student', studentRoutes); // Mount student routes under /student
app.use('/advising', advisingRoutes); // Mount advising routes

// Your routes here
app.get('/', (req, res) => {
  res.send('Hello, your session is working!');
});

// MySQL database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.log('Error connecting to database', err);
    return;
  }
  console.log('Database connected');

  // Create the admin user when the database connection is successful
  createAdminUser(); // Call the function to create the admin user
});

// Nodemailer configuration for sending OTP emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Salt rounds for bcrypt password hashing
const saltRounds = 10;

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // Generate a cryptographically secure 6-digit OTP
};

// Sign-up route with OTP verification
const otps = {}; // Memory store for OTPs

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // Session exists, user is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
};

app.get('/home', (req, res) => {
  console.log('Accessing home, session:', req.session);
  if (req.session.user) {
    res.status(200).json({ message: `Welcome to the home page, ${req.session.user.email}!` });
  } else {
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
});

// Profile route - to get user profile details
app.get('/profile', isAuthenticated, (req, res) => {
  // Get the user email from session
  const email = req.session.user?.email;

  if (!email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Fetch user information from the database
  const query = 'SELECT firstName, lastName, email, department, degree, uin FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Server error while fetching profile' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user profile details
    const user = result[0]; // The result will contain the user's profile data
    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      degree: user.degree,
      uin: user.uin,
    });
  });
});

// Update Profile Route (except for email)
app.post('/profile', isAuthenticated, (req, res) => {
  console.log("Received data:", req.body); // Log the received data from frontend

  const { firstName, lastName, department, degree, uin } = req.body;
  const email = req.session.user?.email;

  if (!email) {
    console.log("Unauthorized: no email found in session.");
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Update the user information in the database
  const updateQuery = 'UPDATE users SET firstName = ?, lastName = ?, department = ?, degree = ?, uin = ? WHERE email = ?';
  db.query(updateQuery, [firstName, lastName, department, degree, uin, email], (err, result) => {
    if (err) {
      console.error('Error updating user profile:', err);
      return res.status(500).json({ message: 'Server error while updating profile' });
    }

    console.log("Profile updated successfully for email:", email); // Log success

    // Fetch the updated user profile from the database to return
    const fetchUpdatedQuery = 'SELECT firstName, lastName, email, department, degree, uin FROM users WHERE email = ?';
    db.query(fetchUpdatedQuery, [email], (err, result) => {
      if (err) {
        console.error('Error fetching updated profile:', err);
        return res.status(500).json({ message: 'Server error while fetching updated profile' });
      }

      const user = result[0];
      res.status(200).json({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email, // Even though email is not updated, still send it back
        department: user.department,
        degree: user.degree,
        uin: user.uin,
      });
    });
  });
});

// Function to check if the email domain has valid MX records
const checkEmailDomain = async (email) => {
  const domain = email.split('@')[1];  // Extract the domain part from the email
  try {
    const lookupMx = promisify(dns.resolveMx);  // Promisify DNS MX lookup function
    const addresses = await lookupMx(domain);  // Await the DNS MX lookup result
    if (!addresses || addresses.length === 0) {
      throw new Error('No MX records found');
    }
    return true;  // MX records found, domain is valid
  } catch (error) {
    console.error(`MX lookup error for domain ${domain}: ${error.message}`);
    throw new Error('Invalid email domain');
  }
};

// Signup route with MX validation, required field checks, and password validation
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, department, degree, uin } = req.body;
  
    // Backend validation: Check if all required fields are provided
    if (!firstName || !lastName || !email || !password || !department || !degree || !uin) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }
  
    // Password validation: Check if the password meets the required conditions
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain letters, numbers, and special characters.',
      });
    }
  
    // Normalize email to avoid case sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];
  
    // Email format validation using regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Sign-up failed: Entered email address format is invalid.' });
    }
  
    try {
      // MX Record Validation (Domain Check)
      console.log('Checking MX records for domain:', domain);
      await checkEmailDomain(normalizedEmail);  // This will throw an error if the domain is invalid
  
      // Check if the email belongs to an admin
      const checkAdminQuery = 'SELECT * FROM users WHERE email = ? AND is_admin = true';
      db.query(checkAdminQuery, [normalizedEmail], (err, result) => {
        if (err) {
          console.error('Error checking admin email:', err);
          return res.status(500).json({ message: 'Server error while checking admin email.' });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: 'Sign-up failed: Cannot use admin email for registration.' });
        }
  
        // Proceed with sign-up logic if the email is not an admin
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
  
        // Check if the user already exists in the users table
        db.query(checkUserQuery, [normalizedEmail], (err, result) => {
          if (err) {
            console.error('Error checking email:', err);
            return res.status(500).json({ message: 'Server error while checking email' });
          } else if (result.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
          } else {
            // Hash the password before storing it in the database
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
              if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Error hashing password' });
              }
  
              // Generate OTP and store it with an expiry time (5 minutes)
              const otp = generateOTP();
              const otpExpiryTime = Date.now() + 5 * 60 * 1000;  // OTP valid for 5 minutes
              otps[normalizedEmail] = { otp, otpExpiryTime };  // Store OTP in memory
  
              console.log('Generated OTP for', normalizedEmail, ':', otp);
  
              // Set a timeout to remove the OTP after 5 minutes
              setTimeout(() => {
                if (otps[normalizedEmail] && Date.now() > otps[normalizedEmail].otpExpiryTime) {
                  delete otps[normalizedEmail];
                  console.log('OTP expired for', normalizedEmail);
                }
              }, 5 * 60 * 1000);  // 5 minutes in milliseconds
  
              // Insert the user into the temp_users table until OTP verification
              const insertTempUserQuery = `
                INSERT INTO temp_users 
                (firstName, lastName, email, password, department, degree, uin) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
              db.query(insertTempUserQuery, [firstName, lastName, normalizedEmail, hashedPassword, department, degree, uin], (err) => {
                if (err) {
                  console.error('Error inserting temp user:', err);
                  return res.status(500).json({ message: 'Sign-up failed' });
                }
  
                // Send OTP via email
                const mailOptions = {
                  from: process.env.EMAIL_USER,
                  to: normalizedEmail,
                  subject: 'Your OTP for verification',
                  text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
                };
  
                transporter.sendMail(mailOptions, (err, info) => {
                  if (err) {
                    console.error('Error sending OTP email:', err);
                    return res.status(500).json({ message: 'Error sending OTP email' });
                  }
  
                  console.log('OTP email sent to:', normalizedEmail, 'Info:', info.response);
                  return res.status(200).json({ message: 'OTP sent. Please verify your email.', email: normalizedEmail });
                });
              });
            });
          }
        });
      });
    } catch (error) {
      // If email domain is invalid, handle the error here
      console.error('Error validating email domain:', error.message);
      return res.status(400).json({ message: 'Sign-up failed: Entered email address is invalid.' });
    }
  });  

  // Login route with 2FA (OTP)
  app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Normalize the email to avoid case sensitivity issues
    const normalizedEmail = email.toLowerCase().trim();
  
    const query = 'SELECT * FROM users WHERE email = ?';
  
    db.query(query, [normalizedEmail], (err, result) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.status(500).json({ message: 'Server error while checking email' });
      }
  
      if (result.length === 0) {
        return res.status(400).json({ message: 'Invalid email or user does not exist' });
      }
  
      const user = result[0];
  
      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).json({ message: 'Server error while comparing passwords' });
        }
  
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid password' });
        }
  
        const currentTime = Date.now();
  
        // Check if a valid OTP already exists (within 5 minutes)
        if (user.otp && user.otp_expiration && user.otp_expiration > currentTime) {
          console.log('OTP still valid. Resending the same OTP.');
  
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for login',
            text: `Your OTP is: ${user.otp}. It will expire in ${Math.round((user.otp_expiration - currentTime) / 60000)} minutes.`,
          };
  
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.error('Error resending OTP email:', err);
              return res.status(500).json({ message: 'Error resending OTP email' });
            }
  
            console.log(`OTP resent to ${email}: ${info.response}`);
  
            // Set the session with email and admin status
            req.session.user = {
              email: normalizedEmail,
              isAdmin: user.is_admin
            };

            // Log session information for debugging
          console.log('Session after setting user:', req.session);
  
            return res.status(200).json({ message: 'OTP resent. Please verify to continue.', email, isAdmin: user.is_admin });
          });
  
        } else {
          // No valid OTP exists or it has expired, generate a new one
          const otp = generateOTP();
          const otpExpiration = currentTime + 5 * 60 * 1000; // OTP valid for 5 minutes
  
          const otpQuery = 'UPDATE users SET otp = ?, otp_expiration = ? WHERE email = ?';
          db.query(otpQuery, [otp, otpExpiration, normalizedEmail], (err) => {
            if (err) {
              console.error('Error storing OTP in the database:', err);
              return res.status(500).json({ message: 'Error storing OTP' });
            }
  
            console.log(`Generated OTP for ${normalizedEmail}: ${otp}`);
  
            // Send OTP via email
            const mailOptions = {
              from: process.env.EMAIL_USER,
              to: email,
              subject: 'Your OTP for login',
              text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
            };
  
            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                console.error('Error sending OTP email:', err);
                return res.status(500).json({ message: 'Error sending OTP email' });
              }
  
              console.log(`OTP sent to ${email}: ${info.response}`);
  
              // Set the session with email and admin status
              req.session.user = {
                email: normalizedEmail,
                isAdmin: user.is_admin
              };

              // Log session information for debugging
          console.log('Session after setting user:', req.session);

              return res.status(200).json({ message: 'OTP sent. Please verify to continue.', email, isAdmin: user.is_admin });
            });
          });
        }
      });
    });
  });
  
// OTP Verification route for sign-up, login, and forgot-password
app.post('/verify-otp', (req, res) => {
  const { email, otp, action } = req.body;  // Add action ('signup', 'login', or 'forgot-password')

  // Normalize email to handle case sensitivity issues
  const normalizedEmail = email.toLowerCase().trim();
  const currentTime = Date.now(); // Get the current timestamp

  // Handle sign-up OTP verification
  if (action === 'signup') {
    // OTP for sign-up is stored in memory (otps)
    if (!otps[normalizedEmail]) {
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    const { otp: storedOtp, otpExpiryTime } = otps[normalizedEmail];

    // Check if OTP has expired (5 minutes expiry)
    if (currentTime > otpExpiryTime) {
      delete otps[normalizedEmail]; // Remove expired OTP
      return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedOtp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Move user from temp_users to users table for sign-up
    const getTempUserQuery = 'SELECT * FROM temp_users WHERE email = ?';
    db.query(getTempUserQuery, [normalizedEmail], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error while verifying OTP for sign-up' });
      if (result.length === 0) return res.status(404).json({ message: 'User not found' });

      const tempUser = result[0];
      const insertUserQuery = 'INSERT INTO users (firstName, lastName, email, password, department, degree, uin, isVerified) VALUES (?, ?, ?, ?, ?, ?, ?, true)';
      db.query(insertUserQuery, [tempUser.firstName, tempUser.lastName, tempUser.email, tempUser.password, tempUser.department, tempUser.degree, tempUser.uin], (err) => {
        if (err) return res.status(500).json({ message: 'Error completing sign-up' });

        // Delete from temp_users after successful sign-up
        const deleteTempUserQuery = 'DELETE FROM temp_users WHERE email = ?';
        db.query(deleteTempUserQuery, [normalizedEmail], (err) => {
          if (err) return res.status(500).json({ message: 'Error cleaning up temporary data' });

          // Remove OTP from memory after successful verification
          delete otps[normalizedEmail];
          return res.status(200).json({ message: 'Sign-up successful! You can now log in.' });
        });
      });
    });
  } 
  
  // Handle login OTP verification
  else if (action === 'login') {
    const getUserQuery = 'SELECT otp, otp_expiration, is_admin FROM users WHERE email = ?';
    db.query(getUserQuery, [normalizedEmail], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error while verifying OTP for login' });
      if (result.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = result[0];

      // Check if OTP matches and hasn't expired
      if (user.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (currentTime > user.otp_expiration) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
      }

      // OTP is valid, proceed with login
      const clearOtpQuery = 'UPDATE users SET otp = NULL, otp_expiration = NULL WHERE email = ?';
      db.query(clearOtpQuery, [normalizedEmail], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing OTP' });

        // Store user info in session
        req.session.user = { email: normalizedEmail, isAdmin: user.is_admin };
        console.log('User session set:', req.session.user);

        // Check if user is admin
        if (user.is_admin) {
          console.log(`Admin login completed for email: ${normalizedEmail}`);
          return res.status(200).json({ message: 'Admin login successful!', isAdmin: true });
        } else {
          console.log(`Login completed for email: ${normalizedEmail}`);
          return res.status(200).json({ message: 'Login successful!', isAdmin: false });
        }
      });
    });
  } 
  
  // Handle forgot-password OTP verification
  else if (action === 'forgot-password') {
    const getUserQuery = 'SELECT otp, otp_expiration, is_admin FROM users WHERE email = ?';
    db.query(getUserQuery, [normalizedEmail], (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error while verifying OTP for password reset' });
      if (result.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = result[0];

      // Check if the user is an admin
      if (user.is_admin) {
        return res.status(400).json({ message: 'Forgot password is not applicable for admin users.' });
      }

      // Check if OTP matches and hasn't expired
      if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
      if (currentTime > user.otp_expiration) return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });

      // OTP is valid, allow user to reset password
      const clearOtpQuery = 'UPDATE users SET otp = NULL, otp_expiration = NULL WHERE email = ?';
      db.query(clearOtpQuery, [normalizedEmail], (err) => {
        if (err) return res.status(500).json({ message: 'Error clearing OTP' });

        console.log(`OTP verified for password reset for email: ${normalizedEmail}`);
        return res.status(200).json({ message: 'OTP verified. Proceed to reset password.' });
      });
    });
  } else {
    return res.status(400).json({ message: 'Invalid action. Please specify "signup", "login", or "forgot-password".' });
  }
});

// Resend OTP route for sign-up, login, and forgot-password
// Resend OTP route for sign-up, login, and forgot-password
app.post('/resend-otp', (req, res) => {
  const { email, action } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if the action is valid
  if (!action || (action !== 'signup' && action !== 'login' && action !== 'forgot-password')) {
    return res.status(400).json({ message: 'Invalid action. Must be "signup", "login", or "forgot-password".' });
  }

  // If action is 'signup', check in `temp_users` table
  if (action === 'signup') {
    const checkTempUserQuery = 'SELECT * FROM temp_users WHERE email = ?';
    db.query(checkTempUserQuery, [normalizedEmail], (err, result) => {
      if (err) {
        console.error('Error querying temp_users for signup:', err);
        return res.status(500).json({ message: 'Server error while checking for user in temp_users.' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found. Please register again.' });
      }

      // Generate a new OTP
      const otp = generateOTP();
      const otpExpiryTime = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
      otps[normalizedEmail] = { otp, otpExpiryTime };

      console.log(`Generated new OTP for sign-up: ${otp}`);

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: `Your OTP for sign-up`,
        text: `Your OTP is: ${otp} (expires in 5 minutes)`,
      };

      transporter.sendMail(mailOptions, (err) => {
        if (err) {
          console.error('Error sending OTP email:', err);
          return res.status(500).json({ message: 'Error sending OTP email' });
        }
        return res.status(200).json({ message: 'New OTP sent for sign-up.' });
      });
    });
  } else if (action === 'login' || action === 'forgot-password') {
    // For login or forgot-password, check in `users` table
    const checkUserQuery = 'SELECT is_admin FROM users WHERE email = ?';
    db.query(checkUserQuery, [normalizedEmail], (err, result) => {
      if (err) {
        console.error('Error querying users table:', err);
        return res.status(500).json({ message: 'Server error while checking for user in users.' });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isAdmin = result[0].is_admin;

      // If the action is 'forgot-password' and the user is an admin, return an error message
      if (action === 'forgot-password' && isAdmin) {
        return res.status(400).json({ message: 'Forgot password is not applicable for admin users.' });
      }

      // Generate a new OTP
      const otp = generateOTP();
      const otpExpiryTime = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

      const updateOtpQuery = 'UPDATE users SET otp = ?, otp_expiration = ? WHERE email = ?';
      db.query(updateOtpQuery, [otp, otpExpiryTime, normalizedEmail], (err, result) => {
        if (err) {
          console.error(`Error updating OTP for ${action}:`, err);
          return res.status(500).json({ message: `Error updating OTP for ${action}.` });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found. Cannot send OTP.' });
        }

        console.log(`Generated new OTP for ${action}: ${otp}`);

        // Send OTP via email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: normalizedEmail,
          subject: `Your OTP for ${action}`,
          text: `Your OTP is: ${otp} (expires in 5 minutes)`,
        };

        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            console.error('Error sending OTP email:', err);
            return res.status(500).json({ message: 'Error sending OTP email' });
          }
          return res.status(200).json({ message: `New OTP sent for ${action}.` });
        });
      });
    });
  }
});

// Change password route
app.post('/change-password', (req, res) => {
  const { email, newPassword } = req.body;

  // Check if the email and password are provided
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Check if the email belongs to an admin
  const checkAdminQuery = 'SELECT is_admin FROM users WHERE email = ?';
  db.query(checkAdminQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking if user is admin:', err);
      return res.status(500).json({ message: 'Server error while checking admin status.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (result[0].is_admin) {
      return res.status(400).json({ message: 'Forgot password is not applicable for admin users.' });
    }

    // If not admin, proceed with password reset
    // Password validation (same rule as signup)
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must have at least 8 characters, including letters, numbers, and special characters.' });
    }

    // Hash the new password before saving it
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing the password:', err);
        return res.status(500).json({ message: 'Error hashing the password.' });
      }

      // Update the user's password in the database
      const updatePasswordQuery = 'UPDATE users SET password = ? WHERE email = ?';
      db.query(updatePasswordQuery, [hashedPassword, email], (err, result) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ message: 'Error updating password.' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ message: 'Password updated successfully.' });
      });
    });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }

    res.status(200).json({ message: 'Logout successful' });
  });
});

// Admin dashboard route
app.get('/admin-dashboard', verifyAdmin, (req, res) => {
  console.log('Current session:', req.session); // Check the session
  res.status(200).json({ message: 'Welcome to the admin dashboard!' });
});

// Start the server
const PORT = process.env.PORT || 4000;  // Use the port from environment variables or default to 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

