const { executeTrade } = require('./executor');
const { getLongShortRatio } = require('./priceFetcher');
const logger = require('./logger');

const INTERVAL = 15000; // 15 seconds
const AMOUNT = 0.001; // ETH amount per trade

async function runStrategy() {
  try {
    const ratio = await getLongShortRatio();
    const action = parseFloat(ratio.longShortRatio) > 1.2 ? 'SELL' : 'BUY';

    logger.info(`🧠 61K Brain: ${action} ${AMOUNT} ETH`);
    const result = await executeTrade(action, AMOUNT);
    logger.info(`📤 Tx result: ${JSON.stringify(result)}`);
  } catch (err) {
    logger.error('❌ Strategy error:', err.message);
  }
}

function startAutoLoop() {
  logger.info('🔁 Starting 24/7 loop...');
  runStrategy();
  setInterval(runStrategy, INTERVAL);
}

module.exports = { startAutoLoop, runStrategy };
