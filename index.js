const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// 🟢 KLINE: Candles (1m)
app.get("/kline", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: {
        category: "linear",
        symbol: "ETHUSDT",
        interval: "1",
        limit: 1
      }
    });
    const k = response.data.result.list[0];
    res.json({
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5]
    });
  } catch (err) {
    console.error("🔥 KLINE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch KLINE" });
  }
});

// 🟢 TICKER
app.get("/ticker", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/tickers", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    const t = response.data.result.list[0];
    res.json({
      price: t.lastPrice,
      price24h: t.prevPrice24h,
      percent24h: t.price24hPcnt
    });
  } catch (err) {
    console.error("🔥 TICKER ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch TICKER" });
  }
});

// ✅ FIXED — 🟢 MARK PRICE
app.get("/markprice", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/mark-price", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    const markData = response.data?.result?.list?.[0];
    res.json({
      markPrice: markData?.markPrice || "0",
      symbol: markData?.symbol || "ETHUSDT"
    });
  } catch (err) {
    console.error("🔥 MARK PRICE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch MARK PRICE" });
  }
});

// 🟢 ORDERBOOK
app.get("/orderbook", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/orderbook", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    const ob = response.data.result;
    res.json({
      bid: ob.b[0],
      ask: ob.a[0]
    });
  } catch (err) {
    console.error("🔥 ORDERBOOK ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch ORDERBOOK" });
  }
});

// 🟢 TRADES
app.get("/trades", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/recent-trade", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    const last = response.data.result.list[0];
    res.json({
      price: last.price,
      side: last.side,
      qty: last.qty
    });
  } catch (err) {
    console.error("🔥 TRADES ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch TRADES" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ CROAK BACKEND LIVE on PORT ${PORT}`);
});
