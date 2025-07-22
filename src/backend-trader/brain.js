// brain.js ✅ CROAK BOT 61K STRATEGY BRAIN
const logger = require('./logger');

let brainMemoryScore = 50;
let forceBuy = false; // 🔁 Toggleable from UI or dev console if needed

function runStrategy({ price, history, indicators, wallet }) {
  logger.heartbeat("Running 61K strategy check...");

  // 🔐 SAFE CHECK: Missing essential data
  if (!price || !wallet) {
    logger.warn("Missing price or wallet context.");
    return { action: "SKIP", reason: "Missing data" };
  }

  // 🧠 FORCE BUY OVERRIDE
  if (forceBuy) {
    logger.tradeSignal("BUY", { reason: "Force Buy Mode Active" });
    return { action: "BUY", reason: "Force Buy Override" };
  }

  // 💡 BASIC STRATEGY SIMULATION
  const shouldBuy = indicators.rsi < 30 && price < history.avg;
  const shouldSell = indicators.rsi > 70 && price > history.avg;

  if (shouldBuy) {
    logger.tradeSignal("BUY", { rsi: indicators.rsi, avg: history.avg });
    return { action: "BUY", reason: "RSI Low + Under Avg Price" };
  }

  if (shouldSell) {
    logger.tradeSignal("SELL", { rsi: indicators.rsi, avg: history.avg });
    return { action: "SELL", reason: "RSI High + Above Avg Price" };
  }

  // 🚫 NO TRADE CONDITIONS MET
  logger.veto([
    `RSI: ${indicators.rsi}`,
    `Price: ${price}`,
    `Avg: ${history.avg}`,
    `MemoryScore: ${brainMemoryScore}`
  ]);
  return { action: "NONE", reason: "No Signal" };
}

function setForceBuy(enabled = true) {
  forceBuy = enabled;
  logger.warn(`⚠️ FORCE BUY MODE: ${forceBuy ? "ENABLED" : "DISABLED"}`);
}

function getForceBuy() {
  return forceBuy;
}

module.exports = {
  runStrategy,
  setForceBuy,
  getForceBuy,
};
