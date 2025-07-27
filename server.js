// 📦 Full Backend – Live Bybit + All Indicators

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ✅ CRON PING endpoint
app.get("/ping", (req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔁 Ping received from cron job`);
  res.send("✅ Ping OK: " + now);
});

function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// === Indicator Functions ===
function sma(data, period) {
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function ema(data, period) {
  const k = 2 / (period + 1);
  let ema = data[data.length - period];
  for (let i = data.length - period + 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
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
  return { k, d: k }; // Simplified D
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

function parabolicSAR(candles) {
  let af = 0.02, maxAf = 0.2, ep = candles[0].high, sar = candles[0].low, up = true;
  for (let i = 1; i < candles.length; i++) {
    if (up) {
      if (candles[i].low < sar) {
        up = false;
        sar = ep;
        ep = candles[i].low;
        af = 0.02;
      } else {
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + 0.02, maxAf);
        }
        sar += af * (ep - sar);
      }
    } else {
      if (candles[i].high > sar) {
        up = true;
        sar = ep;
        ep = candles[i].high;
        af = 0.02;
      } else {
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + 0.02, maxAf);
        }
        sar -= af * (sar - ep);
      }
    }
  }
  return sar;
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

function obv(candles) {
  let obv = 0;
  for (let i = 1; i < candles.length; i++) {
    const delta = candles[i].close - candles[i - 1].close;
    obv += delta > 0 ? candles[i].volume : delta < 0 ? -candles[i].volume : 0;
  }
  return obv;
}

function pivot(highs, lows, closes) {
  const ph = highs.at(-1), pl = lows.at(-1), pc = closes.at(-1);
  const pp = (ph + pl + pc) / 3;
  return { pp, r1: 2 * pp - pl, s1: 2 * pp - ph };
}

function donchian(candles, period = 20) {
  const slice = candles.slice(-period);
  return {
    high: Math.max(...slice.map(c => c.high)),
    low: Math.min(...slice.map(c => c.low))
  };
}

// === Store Candles ===
let candles = [];

// === Connect to Bybit WebSocket ===
const bybitWS = new WebSocket("wss://stream.bybit.com/v5/public/linear");

bybitWS.on("open", () => {
  console.log("✅ Connected to Bybit WebSocket");
  bybitWS.send(JSON.stringify({ op: "subscribe", args: ["kline.BTCUSDT.1"] }));
});

bybitWS.on("message", (msg) => {
  const parsed = JSON.parse(msg);
  if (!parsed.data || !parsed.topic.includes("kline")) return;

  const k = parsed.data;
  const candle = {
    time: new Date(k.start).getTime(),
    open: parseFloat(k.open),
    high: parseFloat(k.high),
    low: parseFloat(k.low),
    close: parseFloat(k.close),
    volume: parseFloat(k.volume)
  };

  candles.push(candle);
  if (candles.length > 200) candles.shift();

  if (candles.length >= 20) {
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    const indicators = {
      SMA14: sma(closes, 14),
      EMA14: ema(closes, 14),
      MACD: macd(closes),
      ParabolicSAR: parabolicSAR(candles),
      ...adx(candles),
      RSI14: rsi(closes),
      Stoch: stochastic(candles),
      Bollinger: bollinger(closes),
      ATR: atr(candles),
      Donchian: donchian(candles),
      VWAP: vwap(candles),
      OBV: obv(candles),
      Pivot: pivot(highs, lows, closes)
    };

    broadcast({ time: candle.time, indicators });
  }
});

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");
  ws.send(JSON.stringify({ signal: "🧠 Connected to Indicator Feed" }));
});

server.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});
