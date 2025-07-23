// autoLoop.js
const { executeTrade } = require('./executor');
const { getLongShortRatio, getOpenInterest } = require('./priceFetcher');
const logger = require('./logger');

const INTERVAL = 15000;
const AMOUNT = 0.001;

async function decideAction() {
  const ratio = await getLongShortRatio();
  const oi = await getOpenInterest();

  const longRatio = parseFloat(ratio.longShortRatio || 1);
  const oiVal = parseFloat(oi.openInterest || 0);

  if (longRatio > 1.15 && oiVal > 100000000) {
    return 'SELL';
  } else if (longRatio < 0.9 && oiVal > 100000000) {
    return 'BUY';
  } else {
    return null;
  }
}

async function runAutoStrategy() {
  try {
    const action = await decideAction();
    if (!action) {
      logger.heartbeat('No action this cycle.');
      return;
    }

    logger.info(`🧠 61K AUTO: ${action} ${AMOUNT} ETH`);
    const result = await executeTrade(action, AMOUNT);
    logger.info(`📤 TX result: ${JSON.stringify(result)}`);
  } catch (err) {
    logger.error('💥 AutoLoop Error:', err.message);
  }
}

function startAutoLoop() {
  logger.info('🔁 Starting 61K Brain Auto Strategy Loop...');
  runAutoStrategy();
  setInterval(runAutoStrategy, INTERVAL);
}

module.exports = { startAutoLoop };
