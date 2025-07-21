// src/backend-trader/priceFetcher.js

const axios = require('axios');

// Get latest mark price from Bybit V5 API (Linear Contracts)
async function fetchPrice(symbol = 'ETHUSDT') {
  try {
    const url = `https://api.bybit.com/v5/market/tickers?category=linear`;
    const res = await axios.get(url);

    const ticker = res.data?.result?.list?.find(t => t.symbol === symbol);
    const markPrice = parseFloat(ticker?.lastPrice);

    if (isNaN(markPrice)) throw new Error(`Invalid price format for ${symbol}`);

    return markPrice;
  } catch (err) {
    console.error('[❌ ERROR] ❌ Failed to fetch price:', err.message);
    throw err;
  }
}

module.exports = { fetchPrice };
