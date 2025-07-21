const { fetchBybitPrice } = require('./priceFetcher');
const { executeTradeIfConditionsMet } = require('./strategy');
const logger = require('./logger');

async function checkPriceAndTrade() {
  try {
    const price = await fetchBybitPrice();
    logger.info(`💰 Live Bybit Price: $${price}`);
    await executeTradeIfConditionsMet(price);
  } catch (err) {
    logger.error('❌ Error in trading loop:', err.message);
  }
}

module.exports = { checkPriceAndTrade };

