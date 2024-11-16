import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, TextField, Typography, Select, MenuItem, Button, Box } from '@mui/material';

const AdminAdvisingForm = () => {
  const { studentId } = useParams(); // Get the student ID from the URL
  const [advisingData, setAdvisingData] = useState(null);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch data on component load
  useEffect(() => {
    const fetchAdvisingData = async () => {
      try {
        const response = await axios.get(`https://wpproject-backend.onrender.com/admin/advising-sheet/${studentId}`);
        setAdvisingData(response.data);
        setStatus(response.data.status); // Set initial status
      } catch (err) {
        console.error('Error fetching advising data:', err);
        setError('Failed to load advising data.');
      }
    };
    fetchAdvisingData();
  }, [studentId]);

  const handleSubmit = async () => {
    if (!status || !message) {
      setError('Status and message are required.');
      return;
    }
    try {
      await axios.put(`https://wpproject-backend.onrender.com/admin/advising-sheet/${studentId}`, {
        status,
        message,
      });
      alert('Decision submitted successfully!');
    } catch (err) {
      console.error('Error submitting decision:', err);
      setError('Failed to submit decision.');
    }
  };  

  if (!advisingData) {
    return <Typography>Loading...</Typography>; // Show loading state while fetching data
  }

  return (
    <Container>
      <Typography variant="h4">Advising Sheet for {advisingData.firstName} {advisingData.lastName}</Typography>

      {error && <Typography color="error">{error}</Typography>}

      {/* Display Student Data */}
      <Box mt={3}>
        <Typography variant="h6">History</Typography>
        <TextField label="Last Term" value={advisingData.last_term || ''} fullWidth margin="normal" disabled />
        <TextField label="Last GPA" value={advisingData.last_gpa || ''} fullWidth margin="normal" disabled />
        <TextField label="Advising Term" value={advisingData.term || ''} fullWidth margin="normal" disabled />
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Pre-requisites</Typography>
        <TextField
          label="Pre-requisites"
          value={advisingData.prerequisites || ''}
          fullWidth
          margin="normal"
          disabled
          multiline
        />
      </Box>

      <Box mt={3}>
        <Typography variant="h6">Course Plan</Typography>
        <TextField
          label="Course Plan"
          value={advisingData.course_plan || ''}
          fullWidth
          margin="normal"
          disabled
          multiline
        />
      </Box>

      {/* Admin Decision Section */}
      <Box mt={3}>
        <Typography variant="h6">Admin Decision</Typography>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </Select>
        <TextField
          label="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          margin="normal"
          multiline
        />
        <Button variant="contained" color="primary" onClick={handleSubmit} mt={2}>
          Submit Decision
        </Button>
      </Box>
    </Container>
  );
};

export default AdminAdvisingForm;
