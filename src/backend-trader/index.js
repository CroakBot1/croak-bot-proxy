// index.js

const express = require('express');
const { checkPriceAndTrade } = require('./trader'); // Main trading logic
const strategy = require('./strategy'); // For forceBuy/forceSell
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Root: Server alive check
app.get('/', (req, res) => {
  res.send('🐸 Croak Bot Live');
});

// Ping: For CRON uptime services
app.get('/ping', (req, res) => {
  logger.heartbeat('💓 Ping received to keep server awake.');
  res.send('pong');
});

// Manual trigger: Force Buy
app.get('/force-buy', (req, res) => {
  logger.warn('🟢 FORCE BUY triggered manually!');
  strategy.fireBuy('🟢 Manual force buy trigger');
  res.send('✅ Forced BUY triggered');
});

// Manual trigger: Force Sell
app.get('/force-sell', (req, res) => {
  logger.warn('🔴 FORCE SELL triggered manually!');
  strategy.fireSell('🔴 Manual force sell trigger');
  res.send('✅ Forced SELL triggered');
});

// Core loop: Runs every 10 seconds
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
