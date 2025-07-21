const fetchPrice = require('./priceFetcher'); // fetch ETH price from Bybit API
const { shouldBuy, shouldSell } = require('./brain'); // your strategy logic
const logger = require('./logger');

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
      // TODO: Add trade execution logic here (e.g., executor.buyETH())
    } else if (shouldSell(price)) {
      logger.warn(`🔴 SELL SIGNAL triggered at $${price}`);
      // TODO: Add trade execution logic here (e.g., executor.sellETH())
    } else {
      logger.debug(`🟡 No action at $${price} – Waiting for conditions.`);
    }
  } catch (err) {
    logger.error('📉 Error fetching price or executing trade:', err.message);
  }
}

module.exports = {
  checkPriceAndTrade,
};
