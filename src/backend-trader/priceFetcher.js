const axios = require('axios');

// ✅ Get current market price
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

// ✅ Get 1m candles (default: 1000)
async function getCandles(symbol = 'ETHUSDT', interval = '1', limit = 1000) {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await axios.get(url);
  return res.data?.result?.list || [];
}

// ✅ Get orderbook (depth)
async function getOrderbook(symbol = 'ETHUSDT', limit = 25) {
  const url = `https://api.bybit.com/v5/market/orderbook?category=linear&symbol=${symbol}&limit=${limit}`;
  const res = await axios.get(url);
  return res.data?.result || {};
}

// ✅ Get open interest
async function getOpenInterest(symbol = 'ETHUSDT', interval = '5min') {
  const url = `https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${symbol}&interval=${interval}`;
  const res = await axios.get(url);
  return res.data?.result?.list || [];
}

// ✅ Get recent trades
async function getRecentTrades(symbol = 'ETHUSDT') {
  const url = `https://api.bybit.com/v5/market/recent-trade?category=linear&symbol=${symbol}`;
  const res = await axios.get(url);
  return res.data?.result || [];
}

// ✅ Get liquidation data
async function getLiquidations(symbol = 'ETHUSDT', limit = 50) {
  const url = `https://api.bybit.com/v5/market/liquidation?category=linear&symbol=${symbol}&limit=${limit}`;
  const res = await axios.get(url);
  return res.data?.result?.list || [];
}

// ✅ Get funding rate
async function getFundingRate(symbol = 'ETHUSDT') {
  const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`;
  const res = await axios.get(url);
  return res.data?.result?.list?.[0] || {};
}

// ✅ Get mark price (detailed)
async function getMarkPrice(symbol = 'ETHUSDT') {
  const url = `https://api.bybit.com/v5/market/mark-price?category=linear&symbol=${symbol}`;
  const res = await axios.get(url);
  return res.data?.result?.[0] || {};
}

// ✅ Get long/short ratio
async function getLongShortRatio(symbol = 'ETHUSDT', period = '5min') {
  const url = `https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=${symbol}&period=${period}`;
  const res = await axios.get(url);
  return res.data?.result?.list || [];
}

// ✅ Get volume stats
async function getVolumeStats(symbol = 'ETHUSDT') {
  const url = `https://api.bybit.com/v5/market/tickers?category=linear`;
  const res = await axios.get(url);
  const ticker = res.data?.result?.list?.find(t => t.symbol === symbol);
  return {
    volume24h: parseFloat(ticker?.turnover24h || 0),
    usdVolume: parseFloat(ticker?.usdIndexPrice || 0),
    ...ticker
  };
}

module.exports = {
  fetchPrice,
  getCandles,
  getOrderbook,
  getOpenInterest,
  getRecentTrades,
  getLiquidations,
  getFundingRate,
  getMarkPrice,
  getLongShortRatio,
  getVolumeStats
};
