async function loadServer() {
    const server = await import('./server.js'); // Dynamically import the ES module
    return server.default || server; // Return the default export or the module itself
  }
  
  export default loadServer; // Use ESM syntax for compatibility
  