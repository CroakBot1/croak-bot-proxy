// trader.js
const { getCurrentPrice } = require('./priceFetcher');
const { shouldBuy, shouldSell } = require('./brain');
const logger = require('./logger');
const SIGNAL = require('./signal');

let isTrading = false;

async function checkPriceAndTrade() {
  try {
    const price = await getCurrentPrice();

    if (shouldBuy(price)) {
      logger.info('📈 BUY signal detected.');
      SIGNAL.setSignal('BUY');
    } else if (shouldSell(price)) {
      logger.info('📉 SELL signal detected.');
      SIGNAL.setSignal('SELL');
    } else {
      logger.info('🛑 No trade signal at this price.');
      SIGNAL.setSignal('HOLD');
    }

  } catch (err) {
    logger.error('💥 Error during price check:', err.message);
  }
}

function startTrading(interval = 10000) {
  if (isTrading) return;
  isTrading = true;

  logger.info('🚀 Starting 61K strategy loop...');

  setInterval(() => {
    logger.info('⏳ Running 61K strategy check...');
    checkPriceAndTrade();
  }, interval);
}

module.exports = {
  startTrading,
  checkPriceAndTrade // ✅ Exported for external use (executor.js)
};
