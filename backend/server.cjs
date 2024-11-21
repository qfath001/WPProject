async function loadServer() {
    const server = await import('./server.js'); // Dynamically import the ES module
    return server.default || server; // Return the default export or the module itself
  }
  
  module.exports = loadServer; // Export the async loader function for use in tests
  