const express = require('express');
const path = require('path');
const apiRoutes = require('./src/routes');

const app = express();

// Body parser middleware for JSON and URL-encoded forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets (HTML, CSS, JS, Images) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount the QuickBite REST API routes
app.use('/api', apiRoutes);

// Native health check endpoint (CI/CD pipeline test contract)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Explicit route fallback to serve the QuickBite Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`QuickBite running on port ${PORT}`);
    console.log(`Access the website at: http://localhost:${PORT}`);
  });
}
