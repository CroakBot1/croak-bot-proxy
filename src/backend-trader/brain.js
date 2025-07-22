// 🔒 DO NOT REMOVE — dependencies used across brain system
const { fetchPrice, fetchMarketSnapshot } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variables
let brainMemoryScore = 50;
const TOTAL_LAYERS = 20000;

// === Smart Layer Signal System ===
function getLayerSignal(layerId, marketData) {
  const price = marketData.price;
  const volume = marketData.volume;
  const trend = marketData.trend;
  const volatility = marketData.volatility;
  const momentum = marketData.momentum;

  // 1m TF scalping logic from Layer 32+ prioritized
  if (layerId >= 32 && layerId <= 10000) {
    const priceMod = (price % 10) / 10;
    const momentumMod = momentum > 0.5 ? 'BUY' : momentum < -0.5 ? 'SELL' : 'HOLD';
    return priceMod > 0.7 ? 'BUY' : priceMod < 0.3 ? 'SELL' : momentumMod;
  }

  // Memory-based adjustment layers
  if (layerId > 10000 && layerId <= 20000) {
    if (brainMemoryScore > 75) return 'BUY';
    if (brainMemoryScore < 25) return 'SELL';
    return 'HOLD';
  }

  // Default behavior
  return trend > 0 ? 'BUY' : trend < 0 ? 'SELL' : 'HOLD';
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

// 📊 Decision-Making Functions (can be upgraded inside)
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

// 📡 Public Interface (always export these, even if internal logic changes)
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
