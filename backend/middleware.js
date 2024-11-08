// Middleware to verify if the user is authenticated (logged in)
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      next(); // Proceed if the user is authenticated
    } else {
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
  