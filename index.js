// backend/index.js
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const SYMBOL = "ETHUSDT";
const CATEGORY = "linear";
const INTERVAL = 1; // 1m TF

// All Bybit V5 endpoints to fetch
const endpoints = {
  kline: `https://api.bybit.com/v5/market/kline?category=${CATEGORY}&symbol=${SYMBOL}&interval=${INTERVAL}&limit=100`,
  ticker: `https://api.bybit.com/v5/market/tickers?category=${CATEGORY}&symbol=${SYMBOL}`,
  trades: `https://api.bybit.com/v5/market/recent-trade?category=${CATEGORY}&symbol=${SYMBOL}`,
  orderbook: `https://api.bybit.com/v5/market/orderbook?category=${CATEGORY}&symbol=${SYMBOL}`,
  markPrice: `https://api.bybit.com/v5/market/mark-price?symbol=${SYMBOL}`
};

app.get("/", async (req, res) => {
  try {
    const [klineRes, tickerRes, tradesRes, orderbookRes, markRes] = await Promise.all([
      axios.get(endpoints.kline),
      axios.get(endpoints.ticker),
      axios.get(endpoints.trades),
      axios.get(endpoints.orderbook),
      axios.get(endpoints.markPrice)
    ]);

    const data = {
      candles: klineRes.data.result.list || [],
      ticker: tickerRes.data.result.list?.[0] || {},
      trades: tradesRes.data.result.list || [],
      orderbook: orderbookRes.data.result || {},
      markPrice: markRes.data.result || {}
    };

    res.json(data);
  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch from Bybit V5 API" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend fetcher live on port ${PORT}`);
});
