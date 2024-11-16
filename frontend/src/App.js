import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ChangePassword from './components/ChangePassword';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import PrerequisiteForm from './components/PrerequisiteForm';
import CourseAdvisingHistory from './components/CourseAdvisingHistory';
import CourseAdvisingForm from './components/CourseAdvisingForm';
import AdminAdvisingSheets from './components/AdminAdvisingSheets'; // Import AdminAdvisingSheets component
import AdminAdvisingForm from './components/AdminAdvisingForm'; // Import AdminAdvisingForm component

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Sign in route */}
          <Route path="/" element={<SignIn />} />

          {/* Sign up route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Home route */}
          <Route path="/home" element={<Home />} />

          {/* Profile route */}
          <Route path="/profile" element={<Profile />} />

          {/* Forgot password route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* OTP verification route */}
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Change password route */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Admin dashboard route */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Pre-requisites Form route */}
          <Route path="/admin/prerequisites" element={<PrerequisiteForm />} />

          {/* Advising History Form route */}
          <Route path="/student/advising-history" element={<CourseAdvisingHistory />} />

          {/* Advising Form route */}
          <Route path="/student/advising-form" element={<CourseAdvisingForm />} />

          {/* Admin Advising Sheets route */}
          <Route path="/admin/advising-sheets" element={<AdminAdvisingSheets />} /> {/* New Route for Admin Advising Sheets */}

          {/* Admin Advising Form route */}
          <Route path="/admin/advising-form/:studentId" element={<AdminAdvisingForm />} /> {/* New Route for Admin Advising Form */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
