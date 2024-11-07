import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Grid, IconButton, AppBar, Toolbar, Menu, MenuItem } from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import adminImage from '../assets/admin-image.jpg'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Admin Dashboard'; // Set title for the sign-in page
  }, []);

  // Open/Close Menu Handlers
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
   
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApproveAdvisingSheet = () => {
    // Handle the Approve Advising Sheet action
    handleMenuClose();
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <Container maxWidth={false} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Navbar Section */}
      <Grid container justifyContent="space-between" alignItems="center" style={{ padding: '20px' }}>
        {/* Home Icon */}
        <Grid item>
          <IconButton onClick={() => navigate('/admin-dashboard')}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="span" style={{ marginLeft: '10px' }}>
            Admin Dashboard
          </Typography>
        </Grid>

        {/* Hamburger Icon for Dropdown Menu */}
        <Grid item>
          <IconButton onClick={handleMenuClick}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleApproveAdvisingSheet}>Approve Advising Sheet</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {/* Main Content Section */}
      <Grid container spacing={4} style={{ flexGrow: 1, padding: '20px', alignItems: 'center' }}>
        <Grid item xs={12} md={6}>
          <img src={adminImage} alt="Admin" style={{ width: '100%', borderRadius: '8px', height: 'auto' }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h3" gutterBottom>
            Welcome to Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Manage the Course Advising Portal here, approve advising sheets, and manage user actions.
          </Typography>
        </Grid>
      </Grid>

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0', marginTop: 'auto', width: '100%' }}>
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

export default AdminDashboard;
