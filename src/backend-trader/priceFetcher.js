const axios = require('axios');

async function fetchPrice() {
  try {
    const url = 'https://api.bybit.com/v5/market/tickers?category=linear';
    const { data } = await axios.get(url);

    if (!data || !data.result || !data.result.list) {
      console.error('[❌ PRICE FETCH ERROR] Invalid response structure.');
      return null;
    }

    const eth = data.result.list.find(t => t.symbol === 'ETHUSDT');

    if (!eth || !eth.lastPrice) {
      console.error('[❌ PRICE FETCH ERROR] ETHUSDT not found.');
      return null;
    }

    const price = parseFloat(eth.lastPrice);
    console.log('[📡 FETCHED PRICE]', price);
    return price;
  } catch (err) {
    console.error('[❌ PRICE FETCH ERROR]', err.message || err);
    return null;
  }
}

module.exports = fetchPrice;
