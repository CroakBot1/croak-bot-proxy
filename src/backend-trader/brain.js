// ✅ brain.js (auto loop 61k strategy controller)
const { getLongShortRatio } = require('./priceFetcher');
const { executeTrade } = require('./executor');
const logger = require('./logger');

const AMOUNT = 0.001; // ETH amount
const INTERVAL = 15000; // 15 seconds loop

async function runStrategy() {
  try {
    const ratio = await getLongShortRatio();
    const action = parseFloat(ratio.longShortRatio) > 1.2 ? 'SELL' : 'BUY';
    logger.info(`🧠 Strategy: ${action} ${AMOUNT} ETH`);
    const result = await executeTrade(action, AMOUNT);
    logger.info(`📤 Result: ${JSON.stringify(result)}`);
  } catch (err) {
    logger.error('❌ Strategy error:', err.message);
  }
}

function startAutoLoop() {
  logger.info('🔁 AutoLoop started');
  runStrategy();
  setInterval(runStrategy, INTERVAL);
}

module.exports = { runStrategy, startAutoLoop };
