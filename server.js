// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Optional: Load your proxy routes (e.g. from index.js)
try {
  const loadProxyRoutes = require('./index'); // optional
  loadProxyRoutes(app);
} catch (err) {
  console.log('⚠️ No proxy routes loaded');
}

// CRON PING ROUTE
app.get('/ping', (req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔁 Ping received from cron job`);
  
  // Optional: Insert bot logic trigger here
  // run61KBot();

  res.send('✅ Ping OK: ' + now);
});

// Homepage (optional)
app.get('/', (req, res) => {
  res.send('🧠 61K Bot Server is running. Use /ping for cron jobs.');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
