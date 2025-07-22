// ⛓️ Required Connections (always keep)
const { fetchPrice, fetchMarketSnapshot } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variable (used by memory scoring system)
let brainMemoryScore = 50;
const TOTAL_LAYERS = 61000;

// === Layer Signal Logic ===
function getLayerSignal(layerId, marketData) {
  const { price, volume, trend, volatility, momentum, candle } = marketData;

  // 🔍 Trap Detection Filters
  if (layerId >= 100 && layerId < 500) {
    if (price % 5 < 0.5 && volatility > 0.6) return 'SELL';
    if (momentum < -0.3 && candle.pattern === 'reversal') return 'SELL';
  }

  // 🧱 TP EXTENDER
  if (layerId >= 500 && layerId < 1000) {
    if (trend > 0.5 && momentum > 0.5) return 'HOLD';
    if (trend < -0.5 && momentum < -0.5) return 'HOLD';
  }

  // 🔒 Risk Guard Layer v2
  if (layerId >= 1000 && layerId < 2000) {
    if (volume < 1000 && volatility > 0.8) return 'HOLD';
  }

  // 📼 Live Candle Memory Scanner
  if (layerId >= 2000 && layerId < 3000) {
    if (candle.previous === 'trap' && momentum < 0) return 'SELL';
  }

  // 📊 Candle Pattern Reader
  if (layerId >= 3000 && layerId < 4000) {
    if (candle.pattern === 'bullish engulfing') return 'BUY';
    if (candle.pattern === 'bearish engulfing') return 'SELL';
  }

  // 📈 Momentum Validator + Volume
  if (layerId >= 4000 && layerId < 5000) {
    if (momentum > 0.6 && volume > 10000) return 'BUY';
    if (momentum < -0.6 && volume > 10000) return 'SELL';
  }

  // 🔍 Hot Entry / Exit Scanners
  if (layerId >= 5000 && layerId < 8000) {
    if (trend > 0.4 && volatility < 0.5) return 'BUY';
    if (trend < -0.4 && volatility < 0.5) return 'SELL';
  }

  // 🧠 61K V4 Self-Evolving Engine
  if (layerId >= 8000 && layerId < 12000) {
    if (brainMemoryScore > 75) return 'BUY';
    if (brainMemoryScore < 25) return 'SELL';
  }

  // 🌀 Real-Time Candle Decision Engine
  if (layerId >= 12000 && layerId < 16000) {
    return trend > 0 ? 'BUY' : trend < 0 ? 'SELL' : 'HOLD';
  }

  // 💹 External Strategy Plugin Port
  if (layerId >= 16000 && layerId < 20000) {
    if (momentum > 0.3 && price % 3 < 1.5) return 'BUY';
    if (momentum < -0.3 && price % 3 >= 1.5) return 'SELL';
  }

  // 🧠 Main 61K Quantum Core Layers
  if (layerId >= 20000) {
    const modPrice = (price % 10) / 10;
    return modPrice > 0.7 ? 'BUY' : modPrice < 0.3 ? 'SELL' : 'HOLD';
  }

  return 'HOLD';
}

// === Signal Fusion Engine ===
function mergeSignals(signals) {
  const counts = { BUY: 0, SELL: 0, HOLD: 0 };
  signals.forEach(sig => counts[sig]++);

  const weightedBuy = counts.BUY + brainMemoryScore / 10;
  const weightedSell = counts.SELL + (100 - brainMemoryScore) / 10;

  if (weightedBuy > weightedSell && weightedBuy > counts.HOLD) return 'BUY';
  if (weightedSell > weightedBuy && weightedSell > counts.HOLD) return 'SELL';
  return 'HOLD';
}

// 📊 Decision-Making Functions
function analyzeMarket({ price, trend, volume, candle }) {
  return trend > 0.2 ? 'BUY' : trend < -0.2 ? 'SELL' : 'HOLD';
}

function shouldBuy(price) {
  return price % 2 < 1;
}

function shouldSell(price) {
  return price % 2 >= 1;
}

// === Core Brain Loop ===
async function runBrainCycle() {
  logger.info('⏳ Running 61K strategy check...');
  try {
    const marketData = await fetchMarketSnapshot();

    const layerSignals = [];
    for (let i = 1; i <= TOTAL_LAYERS; i++) {
      const signal = getLayerSignal(i, marketData);
      layerSignals.push(signal);
    }

    const finalSignal = mergeSignals(layerSignals);
    logger.info(`🧠 Brain Decision: ${finalSignal}`);

    return {
      layerSignals,
      memoryWeightedSignal: finalSignal,
      finalDecision: finalSignal
    };
  } catch (error) {
    logger.error('💥 Error during brain cycle:', error);
    return null;
  }
}

// 📡 Public Interface
async function getLiveBrainSignal(symbol = 'ETHUSDT') {
  const priceData = await fetchPrice(symbol);
  const decision = analyzeMarket(priceData);

  if (shouldBuy(priceData.price)) {
    logger.info(`🟢 BUY signal at ${priceData.price}`);
    return 'BUY';
  } else if (shouldSell(priceData.price)) {
    logger.info(`🔴 SELL signal at ${priceData.price}`);
    return 'SELL';
  }

  logger.info(`🟡 HOLD signal at ${priceData.price}`);
  return 'HOLD';
}

// 📤 Module Exports — AYAW TANGTANGA NI
module.exports = {
  runBrainCycle,
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
