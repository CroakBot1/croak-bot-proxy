// signal.js

const { fetchPrice, getFundingRate, getLongShortRatio, getOpenInterest, getVolumeStats } = require('./priceFetcher');
const logger = require('./logger');

// Validate signal before executing trade
async function validateSignal({ action, symbol = 'ETHUSDT', amount }) {
  logger.info(`🚦 Signal received: ${action} ${symbol} for amount ${amount}`);

  try {
    const currentPrice = await fetchPrice(symbol);
    const funding = await getFundingRate(symbol);
    const longShort = await getLongShortRatio(symbol);
    const openInterest = await getOpenInterest(symbol);
    const volumeStats = await getVolumeStats(symbol);

    // Example decision logic (adjustable)
    const isBullish = funding.fundingRate > 0 && longShort.longShortRatio < 1.5;
    const isBearish = funding.fundingRate < 0 && longShort.longShortRatio > 1.5;

    let allowTrade = false;
    if (action === 'BUY' && isBullish) allowTrade = true;
    if (action === 'SELL' && isBearish) allowTrade = true;

    logger.info(`📈 Price: $${currentPrice} | 📊 Funding: ${funding.fundingRate} | 🧠 Long/Short: ${longShort.longShortRatio}`);

    return {
      success: allowTrade,
      reason: allowTrade ? "Signal validated." : "Market conditions not favorable.",
      data: {
        price: currentPrice,
        fundingRate: funding.fundingRate,
        longShortRatio: longShort.longShortRatio,
        openInterest,
        volumeStats,
      }
    };
  } catch (err) {
    logger.error('⚠️ Error during signal validation:', err);
    return { success: false, reason: 'Signal validation error.' };
  }
}

module.exports = {
  validateSignal
};
