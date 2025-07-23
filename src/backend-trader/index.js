const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.bybit.com/v5/market/tickers?category=linear');
    const eth = response.data.result.list.find(x => x.symbol === 'ETHUSDT');
    res.json({
      symbol: 'ETHUSDT',
      price: parseFloat(eth.lastPrice),
      markPrice: parseFloat(eth.markPrice),
      openInterest: parseFloat(eth.openInterest),
      turnover24h: parseFloat(eth.turnover24h)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bybit Data Fetcher Running @ ${PORT}`));
