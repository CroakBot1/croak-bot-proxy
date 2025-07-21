const axios = require('axios');

async function fetchPrice() {
  try {
    const res = await axios.get('https://api.bybit.com/v5/market/tickers?category=linear');
    const tickers = res.data.result.list;
    const eth = tickers.find(t => t.symbol === 'ETHUSDT');
    const price = parseFloat(eth.lastPrice);

    console.log('[📡 FETCHED PRICE]', price);  // ← Important log
    return price;
  } catch (err) {
    console.error('[❌ PRICE FETCH ERROR]', err.message);
    return null;
  }
}

module.exports = fetchPrice;
