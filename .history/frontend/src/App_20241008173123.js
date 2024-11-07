import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Import Material UI's ThemeProvider and CssBaseline
import theme from './theme/theme';  // Correct import path for theme

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/Home';
import ForgotPassword from './components/ForgotPassword';
import VerifyOtp from './components/VerifyOtp';
import ChangePassword from './components/ChangePassword'; // Import ChangePassword component
import Profile from './components/Profile'; // Import Profile component
import AdminDashboard from './components/AdminDashboard'; /// Import AdminDashboard component

const App = () => {
  return (
    <ThemeProvider theme={theme}> {/* Wrap the app with ThemeProvider */}
      <CssBaseline /> {/* Ensures consistent baseline styling across browsers */}
      <Router>
        <Routes>
          {/* Sign in route */}
          <Route path="/" element={<SignIn />} />

          {/* Sign up route */}
          <Route path="/signup" element={<SignUp />} />

          {/* Home route */}
          <Route path="/home" element={<Home />} />

          {/* Profile route */}
          <Route path="/profile" element={<Profile />} /> {/* Added Profile route */}

          {/* Forgot password route */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* OTP verification route */}
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Change password route */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Admin dashboard route */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* Added Admin Dashboard route */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
