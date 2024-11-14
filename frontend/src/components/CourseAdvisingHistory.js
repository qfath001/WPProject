import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Grid, IconButton
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';

const CourseAdvisingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch advising history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://wpproject-backend.onrender.com/student/advising-history', { withCredentials: true });
        
        if (response.data.length === 0) {
          setHistory([]); // Set empty history if no records found
        } else {
          setHistory(response.data);  // Populate history if records are found
        }

        setLoading(false);
      } catch (error) {
        setError('Failed to fetch advising history');
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);
  
  const handleStatusClick = (term, status) => {
      navigate(`/student/advising-form?advisingTerm=${encodeURIComponent(term)}&status=${status}`);
  };  

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container style={{ flexGrow: 1 }}>
        <Grid container justifyContent="space-between" alignItems="center" style={{ padding: '20px' }}>
          <Grid item>
            <IconButton onClick={() => navigate('/home')}>
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" component="span" style={{ marginLeft: '10px' }}>
              Course Advising History
            </Typography>
          </Grid>
        </Grid>

        {history.length === 0 ? (
          <Typography>No advising history found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Term</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.term}</TableCell>
                    <TableCell 
                      style={{ color: record.status === 'Pending' ? 'blue' : 'black', cursor: 'pointer' }}
                      onClick={() => handleStatusClick(record.term, record.status)}
                    >
                      {record.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      <footer style={{ backgroundColor: '#00205B', color: 'white', padding: '20px 0', width: '100%' }}>
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
    </div>
  );
};

export default CourseAdvisingHistory;
