// 🔓 UNLOCKED: 61K Quantum Brain Backend Proxy (with clean structure)
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

// ✅ INDICATORS (Manual MA/EMA; Structure-ready for others)
app.get("/indicators", async (req, res) => {
  try {
    const klineRes = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: {
        category: "linear",
        symbol: "ETHUSDT",
        interval: "1",
        limit: 100
      }
    });

    const candles = klineRes.data.result.list;
    const closes = candles.map(c => parseFloat(c[4])).reverse();

    // MA
    const ma = (closes.reduce((a, b) => a + b, 0) / closes.length).toFixed(2);

    // EMA
    let ema = closes[0];
    const smoothing = 2;
    const period = 14;
    const multiplier = smoothing / (period + 1);
    for (let i = 1; i < closes.length; i++) {
      ema = ((closes[i] - ema) * multiplier) + ema;
    }

    res.json({
      ma,
      ema: ema.toFixed(2),
      boll: null,       // structure ready
      sar: null,
      mavol: null,
      macd: null,
      kdj: null,
      wr: null,
      stockRSI: null
    });

  } catch (err) {
    console.error("🔥 INDICATOR ERROR:", err.message);
    res.status(500).json({ error: "Failed to compute indicators" });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});
