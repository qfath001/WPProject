// Middleware to verify if the user is authenticated (logged in)
// Middleware to verify if the user is authenticated (logged in)
function isAuthenticated(req, next) {
  console.log('Session:', req.session); // Log the entire session object
  console.log('Session ID:', req.sessionID); // Log the session ID
  console.log('Request Cookies:', req.cookies); // Log the cookies sent with the request (requires cookie-parser)

  // Skip authentication and always allow the request to proceed
  console.log('Bypassing authentication check');
  next(); // Proceed without checking session or user
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
  