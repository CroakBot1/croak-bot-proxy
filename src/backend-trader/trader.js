const axios = require('axios');
const { shouldBuy, shouldSell } = require('./brain');
const logger = require('./logger');

// === CONFIG ===
const symbol = 'BTCUSDT'; // Change to any symbol you want
const bybitPriceUrl = `https://api.bybit.com/v2/public/tickers?symbol=${symbol}`;

// === MAIN CHECKER ===
async function checkPriceAndTrade() {
  try {
    const response = await axios.get(bybitPriceUrl);
    const ticker = response.data.result[0];

    const price = parseFloat(ticker.last_price);
    logger.info(`📈 Live price for ${symbol}: $${price}`);

    // Decision logic
    if (shouldBuy(price)) {
      logger.success(`🟢 BUY SIGNAL triggered at $${price}`);
      // Add execution logic here if needed
    } else if (shouldSell(price)) {
      logger.warn(`🔴 SELL SIGNAL triggered at $${price}`);
      // Add execution logic here if needed
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
