const axios = require('axios');
const logger = require('./logger');

const BASE_URL = 'https://api.bybit.com/v5/market';

async function fetchPrice(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/tickers?category=linear&symbol=${symbol}`);
    return parseFloat(res.data.result.list[0].lastPrice);
  } catch (err) {
    logger.error('❌ Price fetch error:', err.message);
    return null;
  }
}

module.exports = { fetchPrice };
