// server.js – WebSocket + Express server with CRON ping
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

// 🧠 Simulate indicator data every second
setInterval(() => {
  const fakeData = {
    rsi: (Math.random() * 100).toFixed(2),
    ema: (Math.random() * 3000 + 1000).toFixed(2),
    sma: (Math.random() * 3000 + 1000).toFixed(2),
    macd: {
      macd: (Math.random() * 5).toFixed(3),
      signal: (Math.random() * 5).toFixed(3)
    },
    bb: {
      upper: (Math.random() * 3500).toFixed(2),
      lower: (Math.random() * 2500).toFixed(2)
    },
    atr: (Math.random() * 5).toFixed(3),
    vwap: (Math.random() * 3500).toFixed(2),
    adx: (Math.random() * 50).toFixed(2),
    signal: Math.random() > 0.5 ? "✅ BUY" : "❌ SELL"
  };

  broadcast(fakeData);
}, 1000);

// 🟢 WebSocket connection
wss.on("connection", (ws) => {
  console.log("🔌 Client connected to WebSocket.");
  ws.send(JSON.stringify({ signal: "🧠 Connected to backend WebSocket" }));
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 CROAK BOT BACKEND LIVE on port ${PORT}`);
});
