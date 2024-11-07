import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Grid, Checkbox, CircularProgress, Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material'; // Import home icon
import { useNavigate } from 'react-router-dom'; // Use for navigation
import { Facebook, Twitter, Instagram } from '@mui/icons-material'; // Social media icons


const PrerequisiteForm = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedCourses, setUpdatedCourses] = useState([]); // Keep track of changed courses

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Correcting the API endpoint based on your route definitions
        const response = await axios.get('https://wpproject-backend.onrender.com/admin/courses', { withCredentials: true });
        console.log('Courses fetched from server:', response.data); // Log fetched data
        setCourses(response.data); // Set the courses in the state
        setLoading(false); // Stop loading after successful data fetch
      } catch (error) {
        setError('Error fetching courses');
        console.error('Error fetching courses:', error); // Log error details
        setLoading(false); // Stop loading in case of error
      }
    };

    fetchCourses();
  }, []);

  // Handle checkbox change (no actual save yet)
  const handleToggleEnable = (courseId) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === courseId ? { ...course, enabled: !course.enabled } : course
      )
    );

    // Keep track of the courses that have been modified
    if (!updatedCourses.includes(courseId)) {
      setUpdatedCourses([...updatedCourses, courseId]);
    }
  };

  // Save changes
  const handleSave = async () => {
    try {
      // For each course in updatedCourses, send the update request to the backend
      for (const courseId of updatedCourses) {
        const course = courses.find((course) => course.id === courseId);
        await axios.post(
          'https://wpproject-backend.onrender.com/admin/update-course',
          { id: courseId, enabled: course.enabled },
          { withCredentials: true }
        );
      }
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving course status:', error);
      setError('Error saving course status');
    }
  };

  // If loading, show a spinner
  if (loading) return <CircularProgress />;

  // If there was an error fetching courses, display the error message
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      {/* Home Icon for navigation */}
      <IconButton onClick={() => navigate('/admin-dashboard')}>
        <HomeIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom>
        Manage Prerequisite Courses
      </Typography>

      {/* Table for displaying courses */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6">Level</Typography></TableCell>
              <TableCell><Typography variant="h6">Course</Typography></TableCell>
              <TableCell><Typography variant="h6">Enable/Disable</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.level}</TableCell>
                <TableCell>{course.course_name}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={!!course.enabled}  // Ensure it's a boolean
                    onChange={() => handleToggleEnable(course.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save button */}
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>

      {/* Display error message if any */}
      {error && <Box mt={2}><Typography color="error">{error}</Typography></Box>}

      {/* Footer Section */}
      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0', marginTop: '40px' }}>
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

export default PrerequisiteForm;
