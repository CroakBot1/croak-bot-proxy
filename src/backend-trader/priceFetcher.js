const axios = require('axios');
const logger = require('./logger');

async function getLongShortRatio(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`https://api.bybit.com/v5/market/account-ratio?symbol=${symbol}&period=5m`);
    return res.data.result.list[0];
  } catch (err) {
    logger.error('📉 Error fetching ratio:', err.message);
    return { longShortRatio: 1 }; // fallback
  }
}

module.exports = { getLongShortRatio };
