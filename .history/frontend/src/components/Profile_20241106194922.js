import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Typography, IconButton, TextField, Button, CircularProgress, Box, Avatar, Paper
} from '@mui/material';
import { Home as HomeIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(null); // Store the field being edited
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({}); // Update to handle errors for each field
  const navigate = useNavigate();

  /// Set the page title when component is mounted
  useEffect(() => {
    document.title = 'Profile'; // Set title for the sign-in page
  }, []);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:4000/profile', { withCredentials: true });
        if (response.status === 200) {
          setUserData(response.data);
          setFormData(response.data); // Set form data with fetched user data
          setLoading(false);
        } else {
          navigate('/'); // Redirect to login if not authenticated
        }
      } catch (error) {
        setErrors({ global: 'Failed to fetch profile data. Please try again.' });
        setLoading(false);
        navigate('/'); // Redirect to login if session is invalid
      }
    };

    checkAuthAndFetchProfile();
  }, [navigate]);

  const handleEditClick = (field) => {
    setEditMode(field); // Enable edit mode for the specific field
  };

  const handleSaveClick = async () => {
    const { firstName, lastName, department, degree, uin } = formData;

    // Validation logic
    let validationErrors = {};

    if (!firstName || !/^[a-zA-Z\s]+$/.test(firstName)) {
      validationErrors.firstName = 'First name can only contain alphabets and cannot be blank.';
    }
    if (!lastName || !/^[a-zA-Z\s]+$/.test(lastName)) {
      validationErrors.lastName = 'Last name can only contain alphabets and cannot be blank.';
    }
    if (!department || !/^[a-zA-Z\s]+$/.test(department)) {
      validationErrors.department = 'Department can only contain alphabets and cannot be blank.';
    }
    if (!degree || !/^[a-zA-Z\s]+$/.test(degree)) {
      validationErrors.degree = 'Degree can only contain alphabets and cannot be blank.';
    }
    if (!uin || !/^\d+$/.test(uin)) {
      validationErrors.uin = 'UIN must only contain numbers and cannot be blank.';
    }

    // If there are validation errors, show them and prevent saving
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and proceed to save
    setErrors({});

    try {
      const response = await axios.post('http://localhost:4000/profile', formData, { withCredentials: true });
      if (response.status === 200) {
        setUserData(response.data); // Update the displayed data
        setEditMode(null); // Exit edit mode
      } else {
        setErrors({ global: 'Failed to update profile data.' });
      }
    } catch (error) {
      setErrors({ global: 'Failed to update profile data.' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
    setErrors({}); // Clear any previous error
  };

  // Get Initials from first name and last name
  const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return '';
    return `${firstName[0]}${lastName[0]}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Header Section */}
      <Box style={{ backgroundColor: '#00205B', color: 'white', padding: '30px', textAlign: 'center', position: 'relative' }}>
        <IconButton
          style={{ position: 'absolute', top: '20px', left: '20px', color: 'white' }}
          onClick={() => navigate('/home')}
        >
          <HomeIcon />
        </IconButton>
        <Grid container alignItems="center" justifyContent="center" spacing={2}>
          <Grid item>
            <Avatar style={{ backgroundColor: '#FFFFFF', color: '#00205B', width: 80, height: 80, fontSize: 40 }}>
              {getInitials(formData.firstName, formData.lastName)}
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h3">{`${formData.firstName} ${formData.lastName}`}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Profile Details in a Box */}
      <Box
        component={Paper}
        elevation={3}
        style={{
          padding: '40px',
          margin: '40px',
          backgroundColor: '#f5f5f5',
          maxWidth: '100%',
        }}
      >
        <Grid container justifyContent="center" spacing={2}>
          <Grid item xs={12} md={8}>
            {/* First Name */}
            <Typography variant="body1" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              First Name
              <IconButton onClick={() => handleEditClick('firstName')}><EditIcon /></IconButton>
            </Typography>
            <Typography variant="body2">
              {editMode === 'firstName' ? (
                <>
                  <TextField
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </>
              ) : (
                <span>{formData.firstName}</span>
              )}
            </Typography>

            {/* Last Name */}
            <Typography variant="body1" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Last Name
              <IconButton onClick={() => handleEditClick('lastName')}><EditIcon /></IconButton>
            </Typography>
            <Typography variant="body2">
              {editMode === 'lastName' ? (
                <>
                  <TextField
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </>
              ) : (
                <span>{formData.lastName}</span>
              )}
            </Typography>

            {/* Email (Cannot Edit) */}
            <Typography variant="body1" style={{ fontWeight: 'bold', marginTop: '10px' }}>Email</Typography>
            <Typography variant="body2">{userData.email}</Typography>

            {/* Department */}
            <Typography variant="body1" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Department
              <IconButton onClick={() => handleEditClick('department')}><EditIcon /></IconButton>
            </Typography>
            <Typography variant="body2">
              {editMode === 'department' ? (
                <>
                  <TextField
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.department}
                    helperText={errors.department}
                  />
                </>
              ) : (
                <span>{formData.department}</span>
              )}
            </Typography>

            {/* Degree */}
            <Typography variant="body1" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Degree
              <IconButton onClick={() => handleEditClick('degree')}><EditIcon /></IconButton>
            </Typography>
            <Typography variant="body2">
              {editMode === 'degree' ? (
                <>
                  <TextField
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.degree}
                    helperText={errors.degree}
                  />
                </>
              ) : (
                <span>{formData.degree}</span>
              )}
            </Typography>

            {/* UIN */}
            <Typography variant="body1" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              UIN
              <IconButton onClick={() => handleEditClick('uin')}><EditIcon /></IconButton>
            </Typography>
            <Typography variant="body2">
              {editMode === 'uin' ? (
                <>
                  <TextField
                    name="uin"
                    value={formData.uin}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.uin}
                    helperText={errors.uin}
                  />
                </>
              ) : (
                <span>{formData.uin}</span>
              )}
            </Typography>

            {/* Save Button */}
            {editMode && (
              <Button variant="contained" color="primary" onClick={handleSaveClick} style={{ marginTop: '20px' }}>
                <SaveIcon /> Save
              </Button>
            )}

            {/* Global Error Message */}
            {errors.global && (
              <Typography color="error" style={{ marginTop: '20px' }}>
                {errors.global}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>

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

export default Profile;
