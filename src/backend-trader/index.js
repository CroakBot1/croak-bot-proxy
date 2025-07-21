// index.js

const express = require('express');
const { checkPriceAndTrade } = require('./trader'); // Main trading logic
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Manual check
app.get('/', (req, res) => {
  res.send('🐸 Croak Bot Live');
});

// Uptime ping for Render or other CRON
app.get('/ping', (req, res) => {
  logger.heartbeat('💓 Ping received to keep server awake.');
  res.send('pong');
});

// Core auto-trade loop
setInterval(async () => {
  try {
    logger.info('⏳ Running 61K strategy check...');
    await checkPriceAndTrade();
  } catch (err) {
    logger.error('🔥 Trading loop error:', err.message);
  }
}, 10 * 1000); // 10s interval

// Server startup
app.listen(PORT, () => {
  logger.info(`🚀 CROAK BOT listening on port ${PORT}`);
});
