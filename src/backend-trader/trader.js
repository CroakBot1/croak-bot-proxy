// trader.js
const fetchPrice = require('./priceFetcher'); // Fetch ETH price from Bybit or any source
const { shouldBuy, shouldSell } = require('./brain'); // Strategy logic (61K, filters, etc)
const logger = require('./logger'); // Custom log formatter
const executor = require('./executor'); // Trade executor (Uniswap live)

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
      await executor.buyETH(); // Call the buy function
    } else if (shouldSell(price)) {
      logger.warn(`🔴 SELL SIGNAL triggered at $${price}`);
      await executor.sellETH(); // Call the sell function
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
