const { executeTrade } = require('./executor');
const { getLongShortRatio } = require('./priceFetcher');
const logger = require('./logger');

const AMOUNT = 0.001;
const INTERVAL = 15000;

async function runStrategy() {
  try {
    const ratio = await getLongShortRatio();
    const action = parseFloat(ratio.longShortRatio) > 1.2 ? 'SELL' : 'BUY';
    logger.info(`🧠 Strategy decision: ${action} | Ratio: ${ratio.longShortRatio}`);
    const result = await executeTrade(action, AMOUNT);
    logger.info(`✅ Executed ${action}: TX Hash: ${result.hash || 'N/A'}`);
  } catch (err) {
    logger.error('❌ Strategy error:', err.message);
  }
}

function startAutoLoop() {
  logger.info('🔁 24/7 auto-trading loop started...');
  runStrategy();
  setInterval(runStrategy, INTERVAL);
}

module.exports = { startAutoLoop };
