const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// 🟢 KLINE: Candles (1m, 5m, etc.)
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

// 🟢 TICKER: Price snapshot and volume
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

// 🟢 MARK PRICE
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

// 🟢 ORDERBOOK
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

// 🟢 TRADES
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

app.listen(PORT, () => {
  console.log(`✅ CROAK BACKEND LIVE on PORT ${PORT}`);
});
