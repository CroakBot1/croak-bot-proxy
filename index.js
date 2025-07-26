// index.js – Croak Bot Proxy + WebSocket Feed
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());

// Ping endpoint
app.get("/ping", (req, res) => {
  res.send("🐸 Croak Bot Proxy is alive!");
});

// WebSocket handler
wss.on("connection", (client) => {
  console.log("🟢 New WebSocket client connected");

  // Connect to Bybit V5 WebSocket
  const bybitWS = new WebSocket("wss://stream.bybit.com/v5/public/linear");

  bybitWS.on("open", () => {
    console.log("📡 Connected to Bybit V5 WebSocket");

    // Subscribe to 1-minute kline for ETHUSDT
    const subMsg = {
      op: "subscribe",
      args: ["kline.1.ETHUSDT"]
    };
    bybitWS.send(JSON.stringify(subMsg));
  });

  bybitWS.on("message", (data) => {
    try {
      const json = JSON.parse(data);
      if (json.topic && json.topic.startsWith("kline.1")) {
        client.send(JSON.stringify(json));
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err.message);
    }
  });

  bybitWS.on("close", () => {
    console.log("🔌 Bybit WS closed");
  });

  bybitWS.on("error", (err) => {
    console.error("🚨 Bybit WS Error:", err.message);
  });

  client.on("close", () => {
    console.log("🔴 WebSocket client disconnected");
    bybitWS.close();
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Croak Bot Backend running on port ${PORT}`);
});
