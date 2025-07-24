const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// 🟢 KLINE: Candlesticks
app.get("/kline", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: {
        category: "linear",
        symbol: "ETHUSDT",
        interval: "1",
        limit: 200
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 KLINE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch KLINE" });
  }
});

// 🟢 TICKER: Price and volume snapshot
app.get("/ticker", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/tickers", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 TICKER ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch TICKER" });
  }
});

// ✅ FIXED: MARK PRICE (real-time)
app.get("/markprice", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/mark-price", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 MARK PRICE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch MARK PRICE" });
  }
});

// 🟢 ORDERBOOK: Live bid/ask
app.get("/orderbook", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/orderbook", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 ORDERBOOK ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch ORDERBOOK" });
  }
});

// 🟢 TRADES: Recent trades
app.get("/trades", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/recent-trade", {
      params: {
        category: "linear",
        symbol: "ETHUSDT"
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 TRADES ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch TRADES" });
  }
});

// ✅ ROOT TEST ENDPOINT
app.get("/", (req, res) => {
  res.send("✅ CROAK BACKEND ONLINE — Bybit V5 API Proxy");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ CROAK BACKEND LIVE on PORT ${PORT}`);
});
