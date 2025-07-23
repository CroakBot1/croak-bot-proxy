const axios = require('axios');
const logger = require('./logger');

async function getLongShortRatio() {
  try {
    const res = await axios.get('https://api.bybit.com/v5/market/open-interest/long-short-ratio?category=linear&symbol=ETHUSDT&interval=15min');
    const ratio = res.data.result.list[0];
    return ratio;
  } catch (err) {
    logger.error('❌ Failed to fetch long-short ratio:', err.message);
    return { longShortRatio: 1 };
  }
}

module.exports = { getLongShortRatio };
