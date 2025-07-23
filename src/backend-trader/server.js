// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startAutoLoop } = require('./src/backend-trader/brain');
const { executeTrade } = require('./src/backend-trader/executor');
const logger = require('./src/backend-trader/logger');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Croak Bot Cronjob ping received at ' + new Date().toISOString());
});

// ✅ Optional manual trigger
app.get('/trigger', async (req, res) => {
  try {
    const { runStrategy } = require('./src/backend-trader/brain');
    await runStrategy();
    res.send('✅ Strategy executed at ' + new Date().toISOString());
  } catch (err) {
    console.error('❌ Error running strategy:', err);
    res.status(500).send('Error executing strategy.');
  }
});

// ✅ Optional manual BUY/SELL (useful for testing)
app.get('/buy', async (req, res) => {
  try {
    const result = await executeTrade('BUY', 0.001);
    res.json(result);
  } catch (err) {
    logger.error('BUY error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/sell', async (req, res) => {
  try {
    const result = await executeTrade('SELL', 0.001);
    res.json(result);
  } catch (err) {
    logger.error('SELL error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server and loop
app.listen(PORT, () => {
  logger.info(`🚀 Croak Cronjob Server running on port ${PORT}`);
  startAutoLoop(); // 🔁 Starts 24/7 strategy loop
});
