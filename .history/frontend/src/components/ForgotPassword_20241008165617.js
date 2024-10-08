import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Container, Link } from '@mui/material'; // Material UI components
import oduLogo from '../assets/odu-logo.png'; // Import your ODU logo or image
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /// Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Forgot Password'; // Set title for the sign-in page
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/resend-otp', {
        email,
        action: 'forgot-password',
      });

      if (response.status === 200) {
        if (window.confirm('OTP sent to your email. Click "OK" to verify the OTP.')) {
          navigate(`/verify-otp`, { state: { email, action: 'forgot-password' } });
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error sending OTP.');
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
              Forgot Password
            </Typography>
            <Typography variant="body1" gutterBottom align="center">
              We’ll email you a link so you can reset your password.
            </Typography>

            {errorMessage && (
              <Typography color="error" align="center">
                {errorMessage}
              </Typography>
            )}

            <form onSubmit={handleSendOtp} style={{ width: '100%' }}>
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
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Reset Password'}
                  </Button>
                </Grid>

                <Grid item xs={12} align="center">
                  <Typography>
                    or{' '}
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

export default ForgotPassword;
