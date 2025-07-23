const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const BYBIT_API = "https://api.bybit.com/v5/market/tickers?category=linear&symbol=ETHUSDT";

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(BYBIT_API);
    const ticker = response.data.result.list[0];

    res.json({
      price: ticker.lastPrice,
      markPrice: ticker.markPrice,
      openInterest: ticker.openInterest,
      turnover24h: ticker.turnover24h
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Bybit", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
