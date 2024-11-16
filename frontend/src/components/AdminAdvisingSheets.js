import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminAdvisingSheets = () => {
  const [advisingSheets, setAdvisingSheets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdvisingSheets = async () => {
      try {
        const response = await axios.get('https://wpproject-backend.onrender.com/admin/advising-sheets');
        setAdvisingSheets(response.data);
      } catch (err) {
        console.error('Error fetching advising sheets:', err);
        setError('Failed to load advising sheets.');
      }
    };
    fetchAdvisingSheets();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Advising Sheets
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>UIN</TableCell>
              <TableCell>Term</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {advisingSheets.map(sheet => (
              <TableRow key={sheet.id}>
                <TableCell>
                  <Link to={`/admin/advising-sheet/${sheet.id}`}>
                    {sheet.firstName} {sheet.lastName}
                  </Link>
                </TableCell>
                <TableCell>{sheet.uin}</TableCell>
                <TableCell>{sheet.term}</TableCell>
                <TableCell>{sheet.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminAdvisingSheets;
