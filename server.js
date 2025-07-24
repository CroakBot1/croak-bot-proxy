// 🔓 UNLOCKED: 61K Quantum Brain Backend Proxy (Full Real-Time Indicators with RSI)
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

// ✅ TICKER
app.get("/ticker", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/tickers", {
      params: { category: "linear", symbol: "ETHUSDT" }
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

// ✅ KLINE
app.get("/kline", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: { category: "linear", symbol: "ETHUSDT", interval: "1", limit: 100 }
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
      params: { category: "linear", symbol: "ETHUSDT" }
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
      params: { category: "linear", symbol: "ETHUSDT" }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔥 TRADES ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch trades" });
  }
});

// RSI CALCULATOR
function calculateRSI(closes, period = 14) {
  const deltas = closes.map((c, i, arr) => i > 0 ? c - arr[i - 1] : 0).slice(1);
  let gains = deltas.map(d => d > 0 ? d : 0);
  let losses = deltas.map(d => d < 0 ? -d : 0);
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
  let rsis = [];

  for (let i = period; i < deltas.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsis.push(100 - (100 / (1 + rs)));
  }
  return rsis;
}

// ✅ INDICATORS (Full Real-Time + RSI)
app.get("/indicators", async (req, res) => {
  try {
    const response = await axios.get("https://api.bybit.com/v5/market/kline", {
      params: { category: "linear", symbol: "ETHUSDT", interval: "1", limit: 100 }
    });

    const candles = response.data.result.list;
    const closes = candles.map(c => parseFloat(c[4])).reverse();
    const highs = candles.map(c => parseFloat(c[2])).reverse();
    const lows = candles.map(c => parseFloat(c[3])).reverse();

    const ma = (closes.reduce((a, b) => a + b, 0) / closes.length).toFixed(2);

    let ema = closes[0];
    const smoothing = 2, period = 14;
    const multiplier = smoothing / (period + 1);
    for (let i = 1; i < closes.length; i++) {
      ema = ((closes[i] - ema) * multiplier) + ema;
    }

    const bollPeriod = 20;
    const recentCloses = closes.slice(0, bollPeriod);
    const sma = recentCloses.reduce((a, b) => a + b, 0) / bollPeriod;
    const stdDev = Math.sqrt(recentCloses.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / bollPeriod);
    const boll = {
      upper: (sma + 2 * stdDev).toFixed(2),
      middle: sma.toFixed(2),
      lower: (sma - 2 * stdDev).toFixed(2)
    };

    const emaCalc = (data, p) => {
      let result = data[0];
      const mult = 2 / (p + 1);
      for (let i = 1; i < data.length; i++) {
        result = ((data[i] - result) * mult) + result;
      }
      return result;
    };

    const macdLine = emaCalc(closes, 12) - emaCalc(closes, 26);
    const signalLine = emaCalc([macdLine], 9);
    const macd = { macd: macdLine.toFixed(2), signal: signalLine.toFixed(2) };

    const sar = lows[0];

    const low9 = Math.min(...lows.slice(0, 9));
    const high9 = Math.max(...highs.slice(0, 9));
    const rsv = ((closes[0] - low9) / (high9 - low9)) * 100;
    const k = rsv;
    const d = (2 / 3) * k + (1 / 3) * 50;
    const j = 3 * k - 2 * d;
    const kdj = { k: k.toFixed(2), d: d.toFixed(2), j: j.toFixed(2) };

    const high14 = Math.max(...highs.slice(0, 14));
    const low14 = Math.min(...lows.slice(0, 14));
    const wr = (((high14 - closes[0]) / (high14 - low14)) * -100).toFixed(2);

    const rsiArray = calculateRSI(closes, 14);
    const rsi = rsiArray[rsiArray.length - 1]?.toFixed(2) || null;

    res.json({
      ma,
      ema: ema.toFixed(2),
      boll,
      macd,
      sar,
      kdj,
      wr,
      rsi,
      mavol: null,
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
