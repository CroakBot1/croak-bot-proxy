// trader.js
const fetchPrice = require('./priceFetcher');
const { shouldBuy, shouldSell } = require('./brain');
const logger = require('./logger');
const executor = require('./executor');

async function checkPriceAndTrade() {
  try {
    const price = await fetchPrice();
    if (!price) {
      logger.error('📉 Failed to fetch ETH price');
      return;
    }

    logger.info(`📈 Live ETH price: $${price}`);

    if (shouldBuy(price)) {
      logger.success(`🟢 BUY SIGNAL triggered at $${price}`);
      await executor.buyETH(); // <-- execute via executor
    } else if (shouldSell(price)) {
      logger.warn(`🔴 SELL SIGNAL triggered at $${price}`);
      await executor.sellETH(); // <-- execute via executor
    } else {
      logger.debug(`🟡 No trade action at $${price} – Monitoring…`);
    }
  } catch (err) {
    logger.error('📛 Error in trade logic or execution:', err.message);
  }
}

module.exports = {
  checkPriceAndTrade,
};
