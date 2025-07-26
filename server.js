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
app.get('/ping', (req, res) => {
  const now = new Date().toISOString();
  console.log(`[${now}] 🔁 Ping received from cron job`);
  res.send('✅ Ping OK: ' + now);
});

// 🔄 Broadcast function
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// 📊 Indicator Calculations
function calcSMA(data, period) {
  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}

function calcEMA(data, period) {
  const k = 2 / (period + 1);
  let ema = data[data.length - period];
  for (let i = data.length - period + 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(data, period) {
  let gains = 0, losses = 0;
  for (let i = data.length - period; i < data.length - 1; i++) {
    const change = data[i + 1] - data[i];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const rs = gains / (losses || 1);
  return 100 - (100 / (1 + rs));
}

function calcBollingerBands(data, period = 20) {
  const sma = calcSMA(data, period);
  const std = Math.sqrt(data.slice(-period).reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period);
  return { upper: sma + 2 * std, lower: sma - 2 * std };
}

function calcATR(candles, period = 14) {
  let trs = [];
  for (let i = 1; i < candles.length; i++) {
    trs.push(Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    ));
  }
  return calcSMA(trs, period);
}

function calcStochastic(candles, period = 14) {
  const slice = candles.slice(-period);
  const high = Math.max(...slice.map(c => c.high));
  const low = Math.min(...slice.map(c => c.low));
  const close = slice[slice.length - 1].close;
  const k = ((close - low) / (high - low)) * 100 || 0;
  return { k, d: k };
}

function calcMACD(data) {
  const ema12 = calcEMA(data, 12);
  const ema26 = calcEMA(data, 26);
  const macd = ema12 - ema26;
  const last9 = data.slice(-9);
  const signal = calcEMA([...last9, macd], 9);
  return { macd, signal, hist: macd - signal };
}

function calcVWAP(candles) {
  let pv = 0, vol = 0;
  for (let c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    pv += typical * c.volume;
    vol += c.volume;
  }
  return pv / vol;
}

function calcPivot(highs, lows, closes) {
  const ph = highs.at(-1);
  const pl = lows.at(-1);
  const pc = closes.at(-1);
  const pp = (ph + pl + pc) / 3;
  return {
    pp,
    r1: 2 * pp - pl,
    s1: 2 * pp - ph
  };
}

function calcParabolicSAR(candles) {
  let af = 0.02, maxAf = 0.2;
  let ep = candles[0].high;
  let sar = candles[0].low;
  let up = true;
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

// 📊 ADX Calculation
function calcADX(candles, period = 14) {
  let plusDM = 0, minusDM = 0, TR = 0;
  let plusDI = 0, minusDI = 0;

  for (let i = 1; i < candles.length; i++) {
    const highPrev = candles[i - 1].high;
    const high = candles[i].high;
    const lowPrev = candles[i - 1].low;
    const low = candles[i].low;
    const closePrev = candles[i - 1].close;
    const close = candles[i].close;

    const plusDMValue = high - highPrev;
    const minusDMValue = lowPrev - low;

    if (plusDMValue > minusDMValue && plusDMValue > 0) {
      plusDM = plusDMValue;
    } else {
      plusDM = 0;
    }

    if (minusDMValue > plusDMValue && minusDMValue > 0) {
      minusDM = minusDMValue;
    } else {
      minusDM = 0;
    }

    const tr = Math.max(high - low, Math.abs(high - closePrev), Math.abs(low - closePrev));

    TR += tr;

    plusDI += plusDM;
    minusDI += minusDM;

    // Debugging: Log intermediate values
    console.log(`Candle ${i} - PlusDM: ${plusDM}, MinusDM: ${minusDM}, TR: ${tr}, PlusDI: ${plusDI}, MinusDI: ${minusDI}`);
  }

  const smoothedTR = TR / period;
  const smoothedPlusDI = plusDI / period;
  const smoothedMinusDI = minusDI / period;

  const dx = Math.abs(smoothedPlusDI - smoothedMinusDI) / (smoothedPlusDI + smoothedMinusDI) * 100;

  console.log(`Smoothed PlusDI: ${smoothedPlusDI}, Smoothed MinusDI: ${smoothedMinusDI}`);
  console.log(`ADX: ${dx}`);

  return dx;
}

// 📤 Simulate & Send Candlestick Data every second
setInterval(() => {
  const candles = [];
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const time = now - (199 - i) * 60_000;
    const base = 2200 + Math.random() * 50;
    const open = base;
    const high = base + Math.random() * 10;
    const low = base - Math.random() * 10;
    const close = low + Math.random() * (high - low);
    const volume = Math.random() * 1000;

    candles.push([
      time,
      open.toFixed(2),
      high.toFixed(2),
      low.toFixed(2),
      close.toFixed(2),
      volume.toFixed(2)
    ]);
  }

  // Calculate ADX for the new candle data
  const adx = calcADX(candles);
  console.log(`Calculated ADX: ${adx}`);

  broadcast(candles);
}, 1000);

// 🟢 WebSocket connection
wss.on("connection", (ws) => {
  console.log("🔌 Client connected to WebSocket.");
  ws.send(JSON.stringify({ signal: "🧠 Connected to OHLCV WebSocket" }));
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});
