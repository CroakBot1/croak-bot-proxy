// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Optional: If you want to run logic when pinged
app.get('/ping', (req, res) => {
  console.log(`[${new Date().toISOString()}] 🔁 Ping received from cron job.`);
  
  // Optional: run 61K logic or other function here
  // runBotLogic();

  res.send('✅ Ping received!');
});

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.send('🚀 Server is up and running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
