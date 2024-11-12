// Middleware to verify if the user is authenticated (logged in)
function isAuthenticated(req, res, next) {
  console.log('Session:', req.session); // Log the entire session object
  console.log('Session ID:', req.sessionID); // Log the session ID
  console.log('Request Cookies:', req.cookies); // Log the cookies sent with the request (requires cookie-parser)
  
  if (req.session && req.session.user) {
    console.log('User authenticated:', req.session.user); // Log the authenticated user details
    next(); // Proceed if the user is authenticated
  } else {
    console.log('Unauthorized access attempt - No valid session found'); // Log unauthorized attempts
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
}
  
  // Middleware to verify admin access
  function verifyAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
      next(); // Allow access if the user is an admin
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  }
  
  module.exports = {
    isAuthenticated,
    verifyAdmin,
  };
  