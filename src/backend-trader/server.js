require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { startAutoLoop, runStrategy } = require('./src/backend-trader/brain');
const { executeTrade } = require('./src/backend-trader/executor');
const logger = require('./src/backend-trader/logger');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// ✅ Health check — for uptime monitoring & cron job pings
app.get('/', (req, res) => {
  const msg = '✅ Croak Bot Cronjob ping received at ' + new Date().toISOString();
  logger.info(msg);
  res.send(msg);
});

// ✅ Manual trigger for fallback or test execution
app.get('/trigger', async (req, res) => {
  try {
    await runStrategy();
    const msg = '✅ Manual strategy triggered at ' + new Date().toISOString();
    logger.info(msg);
    res.send(msg);
  } catch (err) {
    logger.error('❌ Trigger error:', err.message);
    res.status(500).send('Error executing strategy.');
  }
});

// ✅ Manual BUY and SELL endpoints (optional but useful for UI or debugging)
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

// ✅ Start server + strategy loop
app.listen(PORT, () => {
  logger.info(`🚀 Croak Bot Server running on port ${PORT}`);
  startAutoLoop(); // 🔁 Begin auto 24/7 strategy loop
});
