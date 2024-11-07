import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Grid, Typography, IconButton, Menu, MenuItem, Button
} from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import oduImage from '../assets/advising-image.jpg'; // Replace with actual image path
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons

const Home = () => {
  const [anchorEl, setAnchorEl] = useState(null); // State for the dropdown menu
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  /// Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Home'; // Set title for the sign-in page
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:4000/home', { withCredentials: true });
        if (response.status !== 200) {
          navigate('/'); // Redirect to login if not authenticated
        }
      } catch (error) {
        navigate('/'); // Redirect to login if session is invalid
      }
    };
    checkAuth();
  }, [navigate]);

  // Open/Close Menu Handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle navigation from the dropdown
  const handleViewProfile = () => {
    handleMenuClose();
    navigate('/profile'); // Redirect to profile page
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate('/change-password'); // Redirect to change password page
  };
  
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/logout'); // Destroy session on the server
      navigate('/'); // Redirect to login page after logout
    } catch (error) {
      setMessage('Error logging out'); // Handle logout errors
    }
    handleMenuClose();
  };

  return (
    <Container maxWidth={false} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Navbar Section */}
      <Grid container justifyContent="space-between" alignItems="center" style={{ padding: '20px' }}>
        {/* Home Icon */}
        <Grid item>
          <IconButton onClick={() => navigate('/home')}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="span" style={{ marginLeft: '10px' }}>
            ODU Course Advising Portal
          </Typography>
        </Grid>

        {/* Hamburger Icon for Dropdown Menu */}
        <Grid item>
          <IconButton onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {/* Main Content Section */}
      <Grid container spacing={4} style={{ flexGrow: 1, padding: '20px', alignItems: 'center' }}>
        <Grid item xs={12} md={6}>
          <img src={oduImage} alt="ODU Advising" style={{ width: '100%', borderRadius: '8px', height: 'auto' }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" gutterBottom>
            Welcome to ODU Course Advising Portal
          </Typography>
          <Typography variant="body1">
            The ODU Course Advising Portal helps you with academic guidance, course selection, and personalized advising services to help you succeed.
          </Typography>
        </Grid>
      </Grid>

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0', marginTop: 'auto' }}>
        <Container>
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
    </Container>
  );
};

export default Home;
