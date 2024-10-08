import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Container, Link } from '@mui/material'; // Material UI components
import oduLogo from '../assets/odu-logo.png'; // Import your ODU logo or image
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Verify Otp'; // Set title for the OTP verification page
  }, []);

  // Extract email, action (sign-up, login, forgot-password), and isAdmin from location.state
  const { email, action, isAdmin } = location.state || {};

  if (!email || !action) {
    return <p>Error: Email or action not provided for OTP verification.</p>;
  }

  // Submit OTP for verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/verify-otp', { email, otp, action }, { withCredentials: true });

      if (response.status === 200) {
        if (action === 'signup') {
          setSuccessMessage('OTP verified! Your account is now registered.');
          setTimeout(() => {
            if (window.confirm('Your account is successfully registered. Click "OK" to login.')) {
              navigate('/');  // Redirect to SignIn page
            }
          }, 1500);
        } else if (action === 'login') {
          setSuccessMessage('OTP verified! Redirecting to home page...');

          setTimeout(() => {
            if (isAdmin) {
              // Redirect to admin dashboard if user is an admin
              navigate('/admin-dashboard');
            } else {
              // Redirect to user dashboard if user is not an admin
              navigate('/home');
            }
          }, 1500);
        } else if (action === 'forgot-password') {
          setSuccessMessage('OTP verified! Redirecting to change password page...');
          setTimeout(() => {
            // Ensure that we are passing the correct state (email and isForgotPassword flag) to the change password page
            navigate('/change-password', { state: { email, isForgotPassword: true } });  // Redirect to change password page
          }, 1500);
        }        
      } else {
        throw new Error(response.data.message || 'OTP verification failed.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setResendLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/resend-otp', { email, action });

      if (response.status === 200) {
        alert('New OTP has been sent to your email.');
        setSuccessMessage('A new OTP has been sent to your email.');
        setOtp('');  // Clear the old OTP
      } else {
        throw new Error(response.data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      setErrorMessage('Failed to resend OTP. Try again later.');
    } finally {
      setResendLoading(false);
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
            <Typography variant="h4" component="h1" gutterBottom align="center" style={{ color: '#00205B' }}>
              Verify OTP
            </Typography>
            <Typography variant="body1" gutterBottom align="center">
              An OTP has been sent to your email ({email}). Please enter it below to complete the {action === 'signup' ? 'sign-up' : action === 'login' ? 'login' : 'password reset'} process.
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

            <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="Enter OTP"
                    fullWidth
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Verifying OTP...' : 'Verify OTP'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  {/* Resend OTP Button */}
                  <Button
                    onClick={handleResendOtp}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </Button>
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

export default VerifyOtp; 