const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Optional: Load environment variables if needed
require('dotenv').config();

// Simple health check endpoint for Render Cronjob or uptime monitor
app.get('/', (req, res) => {
  res.send('✅ Croak Bot Cronjob ping received at ' + new Date().toISOString());
});

// Optional: Trigger backend logic here if needed
app.get('/trigger', async (req, res) => {
  try {
    const { runStrategy } = require('./src/backend-trader/index');
    await runStrategy(); // make sure you export a function in index.js
    res.send('✅ Strategy executed at ' + new Date().toISOString());
  } catch (err) {
    console.error('❌ Error running strategy:', err);
    res.status(500).send('Error executing strategy.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Cronjob Server running on port ${PORT}`);
});
