import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Select, MenuItem, TextField, Button, Alert } from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AdminAdvisingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisingData, setAdvisingData] = useState({});
  const [status, setStatus] = useState('Pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdvisingData = async () => {
      try {
        const response = await axios.get(`https://wpproject-backend.onrender.com/admin/advising-sheet/${id}`);
        setAdvisingData(response.data);
        setStatus(response.data.status);
      } catch (err) {
        console.error('Error fetching advising data:', err);
        setError('Failed to load advising data.');
      }
    };
    fetchAdvisingData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      await axios.put(`https://wpproject-backend.onrender.com/admin/advising-sheet/${id}`, { status, message });
      alert('Decision submitted successfully');
      navigate('/admin/advising-sheets');
    } catch (err) {
      console.error('Error updating advising sheet:', err);
      setError('Failed to submit decision.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Advising Sheet for {advisingData.firstName} {advisingData.lastName}</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      
      <Typography variant="h6">History</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}><TextField label="Last Term" value={advisingData.last_term || ''} disabled fullWidth /></Grid>
        <Grid item xs={4}><TextField label="Last GPA" value={advisingData.last_gpa || ''} disabled fullWidth /></Grid>
        <Grid item xs={4}><TextField label="Advising Term" value={advisingData.term || ''} disabled fullWidth /></Grid>
      </Grid>

      <Typography variant="h6" style={{ marginTop: '20px' }}>Pre-requisites</Typography>
      {/* Display prerequisites from advisingData.prerequisites */}

      <Typography variant="h6" style={{ marginTop: '20px' }}>Course Plan</Typography>
      {/* Display course plan from advisingData.course_plan */}

      <Typography variant="h6" style={{ marginTop: '20px' }}>Admin Decision</Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={8}>
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Submit Decision
      </Button>
    </Container>
  );
};

export default AdminAdvisingForm;
