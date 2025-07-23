// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/backend-trader/logger');
const { startAutoLoop } = require('./src/backend-trader/brain');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// ✅ Health check (Render cronjob ping)
app.get('/', (req, res) => {
  res.send('✅ Croak Bot Cronjob ping received at ' + new Date().toISOString());
});

// ✅ Optional manual trigger (for testing only)
app.get('/trigger', async (req, res) => {
  try {
    const { runStrategy } = require('./src/backend-trader/index'); // You must export this manually
    await runStrategy();
    res.send('✅ Strategy executed at ' + new Date().toISOString());
  } catch (err) {
    logger.error('❌ Error running /trigger:', err.message);
    res.status(500).send('Error executing strategy.');
  }
});

// ✅ Start server and 24/7 loop
app.listen(PORT, () => {
  logger.info(`🚀 Cronjob Server running on port ${PORT}`);
  startAutoLoop(); // 💡 This enables 24/7 auto-strategy loop
});
