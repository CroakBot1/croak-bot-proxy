const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const fetch = require("node-fetch"); // ✅ Use v2.x for CommonJS compatibility

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

// === Ping route for uptime check
app.get("/ping", (req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔁 Ping received`);
  res.send("✅ Ping OK: " + now);
});

// === Broadcast to all WebSocket clients
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// === Indicator functions
function sma(data, period) {
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}
function ema(data, period) {
  const k = 2 / (period + 1);
  let emaVal = data[data.length - period];
  for (let i = data.length - period + 1; i < data.length; i++) {
    emaVal = data[i] * k + emaVal * (1 - k);
  }
  return emaVal;
}
function macd(data) {
  const line = ema(data, 12) - ema(data, 26);
  const signal = ema([...data.slice(-9), line], 9);
  return { macd: line, signal, hist: line - signal };
}
function rsi(data, period = 14) {
  let gain = 0, loss = 0;
  for (let i = data.length - period; i < data.length - 1; i++) {
    const delta = data[i + 1] - data[i];
    gain += Math.max(0, delta);
    loss += Math.max(0, -delta);
  }
  const rs = gain / (loss || 1);
  return 100 - (100 / (1 + rs));
}
function stochastic(candles, period = 14) {
  const slice = candles.slice(-period);
  const high = Math.max(...slice.map(c => c.high));
  const low = Math.min(...slice.map(c => c.low));
  const close = slice[slice.length - 1].close;
  const k = ((close - low) / (high - low)) * 100;
  return { k, d: k };
}
function bollinger(data, period = 20) {
  const ma = sma(data, period);
  const std = Math.sqrt(data.slice(-period).reduce((s, v) => s + Math.pow(v - ma, 2), 0) / period);
  return { upper: ma + 2 * std, lower: ma - 2 * std };
}
function atr(candles, period = 14) {
  const trs = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    trs.push(Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close)
    ));
  }
  return sma(trs, period);
}
function adx(candles, period = 14) {
  let plusDM = 0, minusDM = 0, TR = 0;
  for (let i = 1; i < candles.length; i++) {
    const curr = candles[i];
    const prev = candles[i - 1];
    const plus = curr.high - prev.high;
    const minus = prev.low - curr.low;
    plusDM += plus > minus && plus > 0 ? plus : 0;
    minusDM += minus > plus && minus > 0 ? minus : 0;
    TR += Math.max(curr.high - curr.low, Math.abs(curr.high - prev.close), Math.abs(curr.low - prev.close));
  }
  const plusDI = (plusDM / TR) * 100;
  const minusDI = (minusDM / TR) * 100;
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  return { adx: dx, plusDI, minusDI };
}
function vwap(candles) {
  let pv = 0, vol = 0;
  for (const c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    pv += typical * c.volume;
    vol += c.volume;
  }
  return pv / vol;
}

// === Store candles per timeframe
const timeframes = {
  "1m": { candles: [], label: "1m" },
  "5m": { candles: [], label: "5m" },
  "15m": { candles: [], label: "15m" }
};

// === Bybit WebSocket connection
const bybitWS = new WebSocket("wss://stream.bybit.com/v5/public/linear");

bybitWS.on("open", () => {
  console.log("✅ Connected to Bybit WebSocket");
  bybitWS.send(JSON.stringify({
    op: "subscribe",
    args: ["kline.ETHUSDT.1", "kline.ETHUSDT.5", "kline.ETHUSDT.15"]
  }));
});

bybitWS.on("message", (msg) => {
  const parsed = JSON.parse(msg);
  if (!parsed.data || !parsed.topic.includes("kline")) return;

  const tfKey = parsed.topic.split(".").at(-1); // "1", "5", or "15"
  const tfData = timeframes[tfKey + "m"];
  if (!tfData) return;

  const k = parsed.data[0]; // ✅ FIX: access first candle in array
  const candle = {
    time: k.start,
    open: parseFloat(k.open),
    high: parseFloat(k.high),
    low: parseFloat(k.low),
    close: parseFloat(k.close),
    volume: parseFloat(k.volume)
  };

  tfData.candles.push(candle);
  if (tfData.candles.length > 200) tfData.candles.shift();

  if (tfData.candles.length >= 20) {
    const closes = tfData.candles.map(c => c.close);
    const indicators = {
      SMA14: sma(closes, 14),
      EMA14: ema(closes, 14),
      MACD: macd(closes),
      RSI14: rsi(closes),
      Stoch: stochastic(tfData.candles),
      Bollinger: bollinger(closes),
      ATR: atr(tfData.candles),
      ADX: adx(tfData.candles),
      VWAP: vwap(tfData.candles)
    };

    broadcast({ time: candle.time, timeframe: tfData.label, indicators });
  }
});

// === Client connection handler
wss.on("connection", (ws) => {
  console.log("🔌 Client connected");
  ws.send(JSON.stringify({ signal: "🧠 Connected to ETH Indicator Feed" }));
});

// === Start backend server
server.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});

// === 🔁 Optional keep-alive (every 4 mins)
setInterval(() => {
  fetch("https://croak-bot-proxy.onrender.com/ping")
    .then(res => res.text())
    .then(text => console.log("🧬 Keep-alive:", text))
    .catch(err => console.error("❌ Keep-alive error:", err.message));
}, 1000 * 60 * 4);
