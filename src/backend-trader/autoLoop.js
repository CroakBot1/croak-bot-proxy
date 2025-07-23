const { executeTrade } = require('./executor');
const { fetchPrice, getLongShortRatio } = require('./priceFetcher');
const logger = require('./logger');

const INTERVAL = 15000;
const AMOUNT = 0.001;

async function runAutoStrategy() {
  try {
    const ratio = await getLongShortRatio();
    const action = parseFloat(ratio.longShortRatio) > 1.2 ? 'SELL' : 'BUY';

    logger.info(`🧠 Strategy: ${action} ${AMOUNT} ETH`);
    const result = await executeTrade(action, AMOUNT);
    logger.info(`📤 Tx result: ${JSON.stringify(result)}`);
  } catch (err) {
    logger.error('❌ Auto strategy failed:', err.message);
  }
}

function startAutoLoop() {
  logger.info('🔁 Starting auto loop...');
  runAutoStrategy();
  setInterval(runAutoStrategy, INTERVAL);
}

module.exports = { startAutoLoop };
