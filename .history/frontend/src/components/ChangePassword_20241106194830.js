import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Container, IconButton } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material'; // Home icon
import oduLogo from '../assets/odu-logo.png'; // ODU logo
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get location to check for 'forgot password' state

  const isForgotPasswordFlow = location.state?.isForgotPassword; // Check if this is part of the forgot password flow

  /// Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Change Password'; // Set title for the sign-in page
  }, []);

  // Password validation function
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    const authenticateAndFetchEmail = async () => {
      if (isForgotPasswordFlow) {
        // Use email from the forgot password flow
        setEmail(location.state?.email); 
      } else {
        // Fetch the email from the authenticated session
        try {
          const response = await axios.get('http://localhost:4000/profile', { withCredentials: true });
          if (response.status === 200) {
            setEmail(response.data.email); // Set the user's email from the response
          } else {
            navigate('/'); // Redirect to login if not authenticated
          }
        } catch (error) {
          setErrorMessage('Failed to authenticate. Please log in again.');
          navigate('/'); // Redirect to login if session is invalid
        }
      }
    };
  
    authenticateAndFetchEmail();
  }, [navigate, isForgotPasswordFlow, location.state?.email]);  

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setErrorMessage('Password must have at least 8 characters, including letters, numbers, and special characters.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:4000/change-password', {
        email, // Email fetched from useEffect
        newPassword,
      });

      if (response.status === 200) {
        alert('Password updated successfully. You can now log in.');
        navigate('/');
      } else {
        throw new Error('Error updating password.');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating password. Try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container maxWidth="lg" style={{ flexGrow: 1 }}>
        <Grid container spacing={2} style={{ minHeight: '80vh', position: 'relative' }}>
          {/* Home Icon - only show if not in forgot-password flow */}
          {!isForgotPasswordFlow && (
            <IconButton
              style={{ position: 'absolute', top: '20px', left: '20px' }}
              onClick={() => navigate('/home')}
            >
              <HomeIcon />
            </IconButton>
          )}

          {/* Left side ODU logo */}
          <Grid item xs={12} sm={6} container justifyContent="center" alignItems="center">
            <img src={oduLogo} alt="ODU Logo" style={{ maxWidth: '80%', height: 'auto' }} />
          </Grid>

          {/* Right side form */}
          <Grid item xs={12} sm={6} container direction="column" justifyContent="center" alignItems="center">
            <Typography variant="h4" component="h1" gutterBottom align="center" style={{ color: '#00205B' }}>
              Enter the new password and confirm it
            </Typography>

            {errorMessage && (
              <Typography color="error" align="center">
                {errorMessage}
              </Typography>
            )}

            <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="New Password"
                    fullWidth
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    label="Confirm Password"
                    fullWidth
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                    {loading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0', width: '100%', marginTop: 'auto' }}>
        <Container maxWidth={false}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">OLD DOMINION UNIVERSITY</Typography>
              <Typography variant="body2">Norfolk, VA 23529</Typography>
              <Typography variant="body2">
                <a href="https://www.odu.edu/about/contact" style={{ color: 'white', textDecoration: 'underline' }}>
                  Contact us & mailing information
                </a>
              </Typography>
              <Typography variant="body2">
                <a href="https://www.odu.edu/map" style={{ color: 'white', textDecoration: 'underline' }}>
                  Directions to campus
                </a>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">CONNECT WITH #ODU</Typography>
              <Grid container spacing={1}>
                <Grid item>
                  <a href="https://www.facebook.com/ODUGlobal" target="_blank" rel="noopener noreferrer">
                    <Facebook style={{ color: 'white' }} />
                  </a>
                </Grid>
                <Grid item>
                  <a href="https://x.com/ODU/status/1402372767450755074" target="_blank" rel="noopener noreferrer">
                    <Twitter style={{ color: 'white' }} />
                  </a>
                </Grid>
                <Grid item>
                  <a href="https://www.instagram.com/oduglobal/" target="_blank" rel="noopener noreferrer">
                    <Instagram style={{ color: 'white' }} />
                  </a>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body1">USEFUL LINKS</Typography>
              <Typography variant="body2">
                <a href="https://www.odu.edu/apply" style={{ color: 'white', textDecoration: 'underline' }}>
                  Apply to ODU
                </a>
              </Typography>
              <Typography variant="body2">
                <a href="https://www.odu.edu/advancement" style={{ color: 'white', textDecoration: 'underline' }}>
                  Give to ODU
                </a>
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
};

export default ChangePassword;
