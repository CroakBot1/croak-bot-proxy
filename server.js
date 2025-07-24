// 🔒 LOCKED: 61K Quantum Brain Backend Proxy
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ CRON PING
app.get('/ping', (req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔁 Ping received from cron job`);
  res.send('✅ Ping OK: ' + now);
});

// ✅ HOMEPAGE
app.get('/', (req, res) => {
  res.send('🧠 61K Quantum Brain Proxy is running. Use /ping to keep alive.');
});

// ✅ TICKER (includes markPrice)
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
      percent24h: t.price24hPcnt,
      markPrice: t.markPrice
    });
  } catch (err) {
    console.error("🔥 TICKER ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch ticker" });
  }
});

// ✅ KLINE (💡 RSI-ready with 100 candles)
app.get("/kline", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: {
        category: "linear",
        symbol: "ETHUSDT",
        interval: "1",
        limit: 100
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 KLINE ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch kline" });
  }
});

// ✅ ORDERBOOK
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
    res.status(500).json({ error: "Failed to fetch orderbook" });
  }
});

// ✅ TRADES
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
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

// ✅ INDICATORS (Layer 4+)
app.get("/indicators", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/indicator", {
      params: {
        category: "linear",
        symbol: "ETHUSDT",
        interval: "1"
      }
    });

    const indicators = response.data.result;
    res.json({
      ma: indicators.ma,
      ema: indicators.ema,
      boll: indicators.boll,
      sar: indicators.sar,
      mavol: indicators.mavolume,
      macd: indicators.macd,
      kdj: indicators.kdj,
      wr: indicators.wr,
      stockRSI: indicators.stochrsi
    });

  } catch (err) {
    console.error("🔥 INDICATOR ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch indicators" });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});
