const express = require('express');
const { checkPriceAndTrade } = require('./trader');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Root endpoint – for manual health check
app.get('/', (req, res) => {
  res.send('🐸 Croak Bot Live');
});

// Ping endpoint – used by Render cronjob to keep server alive
app.get('/ping', (req, res) => {
  logger.heartbeat('💓 Ping received to keep server awake.');
  res.send('pong');
});

// Main trading loop – runs every 10 seconds
setInterval(async () => {
  try {
    logger.info('⏳ Running 61K strategy check...');
    await checkPriceAndTrade(); // Executes logic from trader.js
  } catch (error) {
    logger.error('🔥 Trading loop error:', error.message);
  }
}, 10 * 1000); // Every 10 seconds

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 CROAK BOT listening on port ${PORT}`);
});
