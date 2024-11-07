import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Container, Link } from '@mui/material'; // Material UI components
import oduLogo from '../assets/odu-logo.png'; // Import your ODU logo or image
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    degree: '',
    uin: '',
  });

   // Set the page title when component is mounted
   useEffect(() => {
    document.title = 'Sign Up'; // Set title for the sign-in page
  }, []);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to validate the email domain
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'odu.edu'];
  const isValidEmailDomain = (email) => {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  };

  // Helper function to validate password strength
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]?)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Helper function to check if fields contain only alphabets
  const isAlphabetsOnly = (text) => {
    const alphabetRegex = /^[a-zA-Z\s]+$/;
    return alphabetRegex.test(text);
  };

  // Helper function to check if UIN contains only numbers
  const isNumeric = (text) => {
    return /^\d+$/.test(text);
  };

  // Helper function to check if all required fields are filled
  const validateForm = () => {
    const { firstName, lastName, email, password, department, degree, uin } = formData;

    if (!firstName || !lastName || !email || !password || !department || !degree || !uin) {
      return false;
    }

    // Check if First Name, Last Name, Department, and Degree are alphabet-only
    if (!isAlphabetsOnly(firstName) || !isAlphabetsOnly(lastName) || !isAlphabetsOnly(department) || !isAlphabetsOnly(degree)) {
      setErrorMessage('First Name, Last Name, Department, and Degree must only contain alphabets.');
      return false;
    }

    // Check if UIN is numeric
    if (!isNumeric(uin)) {
      setErrorMessage('UIN must contain only numbers.');
      return false;
    }

    return true;
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for sign-up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Frontend validation
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    if (!isValidEmailDomain(formData.email)) {
      setLoading(false);
      setErrorMessage('Sign-up failed: The entered email domain is invalid.');
      return;
    }

    if (!isValidPassword(formData.password)) {
      setLoading(false);
      setErrorMessage('Sign-up failed: Password must be at least 8 characters long and contain letters and numbers.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/signup', formData);
      if (response && response.status === 200) {
        window.confirm('OTP has been sent to your email. Please verify.');
        setTimeout(() => {
          navigate(`/verify-otp`, { state: { email: formData.email, action: 'signup' } });
        }, 2000);
      }
    } catch (error) {
       // Handle error messages from the backend
       if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(`Sign-up failed: ${error.response.data.message}`);
      } else {
        setErrorMessage('Sign-up failed due to a network or unknown error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" style={{ minHeight: '90vh' }}>
        <Grid container spacing={2} style={{ minHeight: '80vh' }}>
          {/* Left side image/logo */}
          <Grid item xs={12} sm={6} container justifyContent="center" alignItems="center">
            <img src={oduLogo} alt="ODU Logo" style={{ maxWidth: '80%', height: 'auto' }} />
          </Grid>

          {/* Right side form */}
          <Grid item xs={12} sm={6} container direction="column" justifyContent="center" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Sign Up for the Course Advising Portal
            </Typography>

            {errorMessage && (
              <Typography color="error" align="center">
                {errorMessage}
              </Typography>
            )}

            {successMessage && (
              <Typography color="primary" align="center">
                {successMessage}
              </Typography>
            )}

            <form onSubmit={handleSignUp} style={{ width: '100%' }}>
              <Grid container spacing={2}>
                {/* First Name and Last Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    label="First Name"
                    fullWidth
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    label="Last Name"
                    fullWidth
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Email and Password */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    label="Email"
                    fullWidth
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    label="Password"
                    fullWidth
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Department, Degree/Major, and UIN */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    variant="outlined"
                    label="Department"
                    fullWidth
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    variant="outlined"
                    label="Degree/Major"
                    fullWidth
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    variant="outlined"
                    label="UIN"
                    fullWidth
                    type="text"
                    name="uin"
                    value={formData.uin}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </Grid>

                {/* Already have an account? Log In section */}
                <Grid item xs={12}>
                  <Typography align="center">
                    Already have an account?{' '}
                    <Link
                      onClick={() => navigate('/')}
                      underline="hover"
                      style={{ cursor: 'pointer', color: '#00205B', fontWeight: 'bold' }}
                    >
                      Log in
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>

      {/* Footer with Social Media Icons */}
      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">OLD DOMINION UNIVERSITY</Typography>
              <Typography variant="body2">Norfolk, VA 23529</Typography>
              <Typography variant="body2">
                <Link href="https://www.odu.edu/about/contact" style={{ color: 'white', textDecoration: 'underline' }}>
                  Contact us & mailing information
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link href="https://www.odu.edu/map" style={{ color: 'white', textDecoration: 'underline' }}>
                  Directions to campus
                </Link>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">CONNECT WITH #ODU</Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <Link href="https://www.facebook.com/ODUGlobal" target="_blank" rel="noopener noreferrer">
                    <Facebook style={{ color: 'white' }} />
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="https://x.com/ODU/status/1402372767450755074" target="_blank" rel="noopener noreferrer">
                    <Twitter style={{ color: 'white' }} />
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="https://www.instagram.com/oduglobal/" target="_blank" rel="noopener noreferrer">
                    <Instagram style={{ color: 'white' }} />
                  </Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">OTHER USEFUL LINKS</Typography>
              <Typography variant="body2">
                <Link href="https://www.odu.edu/apply" style={{ color: 'white', textDecoration: 'underline' }}>
                  Apply to ODU
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link href="https://www.odu.edu/advancement" style={{ color: 'white', textDecoration: 'underline' }}>
                  Give to ODU
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </>
  );
};

export default SignUp;
