// src/backend-trader/priceFetcher.js

const axios = require('axios');

// Get latest mark price from Bybit (USDT Perpetual)
async function fetchPrice(symbol = 'ETHUSDT') {
  try {
    const url = `https://api.bybit.com/v2/public/tickers?symbol=${symbol}`;
    const res = await axios.get(url);

    const markPrice = parseFloat(res.data?.result?.[0]?.last_price);
    if (isNaN(markPrice)) throw new Error('Invalid price format');

    return markPrice;
  } catch (err) {
    console.error('[❌ ERROR] ❌ Failed to fetch price:', err.message);
    throw err;
  }
}

module.exports = { fetchPrice };
