import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Container, Link } from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Import icons
import oduLogo from '../assets/odu-logo.png'; // ODU logo image

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Sign In'; // Set title for the sign-in page
  }, []);

  // Handle login and send OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('https://wpproject-backend.onrender.com/login', { email, password });

      // Check if OTP was sent successfully
      if (response.data.message.includes('OTP')) {
        const isAdmin = response.data.isAdmin;
        // Confirm with user to redirect to OTP page
        if (window.confirm('OTP has been sent to your email. Click "OK" to verify.')) {
          navigate(`/verify-otp`, { state: { email, action: 'login', isAdmin } });
        }
      } else {
        setErrorMessage(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to Sign Up page
  const handleSignUpRedirect = () => {
    navigate('/signup');
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
              Log in to your Course Advising Portal
            </Typography>

            {errorMessage && (
              <Typography color="error" align="center">
                {errorMessage}
              </Typography>
            )}

            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="Email"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="Password"
                    fullWidth
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Sign In'}
                  </Button>
                </Grid>

                {/* Forgot Password section */}
                <Grid item xs={12} style={{ marginTop: '10px' }}>
                  <Typography align="center">
                    <Link
                      onClick={() => navigate('/forgot-password')}
                      underline="hover"
                      style={{ cursor: 'pointer', color: '#00205B', fontWeight: 'bold' }}
                    >
                      Forgot Password?
                    </Link>
                  </Typography>
                </Grid>

                {/* Sign Up section */}
                <Grid item xs={12}>
                  <Typography align="center">
                    Don't have an account?{' '}
                    <Link
                      onClick={handleSignUpRedirect}
                      underline="hover"
                      style={{ cursor: 'pointer', color: '#00205B', fontWeight: 'bold' }}
                    >
                      Sign Up now
                    </Link>
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>

      {/* Footer with social media links */}
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

export default SignIn;
