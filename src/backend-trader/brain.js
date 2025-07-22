// brain.js 🧠
// ==========
// 61K QUANTUM STRATEGY CORE — FINAL MERGED VERSION
// ⚠️ DO NOT REMOVE ANY SECTION WITHOUT APPROVAL

// ⛓️ Required Connections (always keep)
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variable (used by memory scoring system)
let brainMemoryScore = 50;

// 📊 Global Internal State
let lastSignal = 'HOLD';
let lastPrice = 0;
let tpExtended = false;

// ===========================
// 🧩 ADVANCED SIGNAL LAYERS
// ===========================

function volumeMomentumValidator({ volume, momentum }) {
  return volume > 70 && momentum > 65;
}

function candlePatternReader(candle) {
  return candle.pattern === 'bullish_engulfing' || candle.pattern === 'hammer';
}

function candleConfidenceScoreSystem(candle) {
  let score = 0;
  if (candle.pattern === 'bullish_engulfing') score += 30;
  if (candle.pattern === 'hammer') score += 20;
  if (candle.strongClose) score += 15;
  return score;
}

function trapDetectionUltra(priceData) {
  return priceData.spike || priceData.suddenDrop;
}

function autoDenialVetoLayer(decision, priceData) {
  if (trapDetectionUltra(priceData)) {
    logger.warn("🚫 VETO: Trap detected, denying trade.");
    return 'HOLD';
  }
  return decision;
}

function tpExtenderFoundation(signal, price) {
  if (signal === 'SELL' && !tpExtended && brainMemoryScore > 60) {
    tpExtended = true;
    logger.info("🧱 TP EXTENDER triggered — extending SELL for higher gain.");
    return 'HOLD';
  } else if (signal === 'SELL' && tpExtended) {
    tpExtended = false; // Reset after forced HOLD
    return 'SELL';
  }
  return signal;
}

function smartEntryFilterLayer(priceData) {
  return priceData.trend === 'up' && volumeMomentumValidator(priceData);
}

function smartExitFilterLayer(priceData) {
  return priceData.trend === 'down' || priceData.weakCandle;
}

// ===========================
// 🔍 MAIN MARKET ANALYSIS
// ===========================

function analyzeMarket(priceData) {
  const candleScore = candleConfidenceScoreSystem(priceData.candle);
  const allowBuy = smartEntryFilterLayer(priceData) && candleScore >= 40;
  const allowSell = smartExitFilterLayer(priceData) || candleScore < 20;

  let signal = 'HOLD';

  if (allowBuy) {
    signal = 'BUY';
  } else if (allowSell) {
    signal = 'SELL';
  }

  // Apply veto & TP extender
  signal = autoDenialVetoLayer(signal, priceData);
  signal = tpExtenderFoundation(signal, priceData.price);

  // Memory Score Influence
  if (signal === 'BUY') brainMemoryScore += 1;
  if (signal === 'SELL') brainMemoryScore -= 1;

  // Limit score range
  brainMemoryScore = Math.max(0, Math.min(100, brainMemoryScore));

  lastSignal = signal;
  lastPrice = priceData.price;

  return signal;
}

// ===========================
// ✅ BUY / SELL DECISIONS
// ===========================

function shouldBuy(price) {
  return lastSignal === 'BUY';
}

function shouldSell(price) {
  return lastSignal === 'SELL';
}

// ===========================
// 📡 BRAIN SIGNAL ENTRYPOINT
// ===========================

async function getLiveBrainSignal(symbol = 'ETHUSDT') {
  const priceData = await fetchPrice(symbol);

  const signal = analyzeMarket(priceData);

  if (signal === 'BUY') {
    logger.info(`🟢 BUY signal at ${priceData.price}`);
  } else if (signal === 'SELL') {
    logger.info(`🔴 SELL signal at ${priceData.price}`);
  } else {
    logger.info(`🟡 HOLD signal at ${priceData.price}`);
  }

  return signal;
}

// ===========================
// 🧠 EXPORT PUBLIC INTERFACE
// ===========================

module.exports = {
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
