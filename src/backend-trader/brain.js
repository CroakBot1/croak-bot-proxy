// src/backend-trader/brain.js
const priceFetcher = require('./priceFetcher');
const logger = require('./logger');

let brainMemoryScore = 50; // initial neutral score (0–100 scale)

function analyzeMarket({ price, trend, volume, candle }) {
  const insights = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reason: '',
  };

  // === LAYER 1: 61K Quantum Core Logic ===
  if (candle.green && candle.size === 'large' && trend === 'up') {
    insights.buySignal = true;
    insights.confidence += 30;
    insights.reason += '🟢 Large green candle + Uptrend\n';
  }

  if (candle.red && candle.size === 'large' && trend === 'down') {
    insights.sellSignal = true;
    insights.confidence += 30;
    insights.reason += '🔴 Large red candle + Downtrend\n';
  }

  // === LAYER 2: Trap Detection ===
  if (candle.wickTop && candle.bodySmall && trend === 'down') {
    insights.sellSignal = true;
    insights.confidence += 20;
    insights.reason += '🪤 Trap detected at top (wick spike)\n';
  }

  if (candle.wickBottom && candle.bodySmall && trend === 'up') {
    insights.buySignal = true;
    insights.confidence += 20;
    insights.reason += '🪤 Trap detected at bottom (wick flush)\n';
  }

  // === LAYER 3: Brain Score Memory ===
  if (brainMemoryScore > 70) {
    insights.buySignal = true;
    insights.confidence += 15;
    insights.reason += '🧠 Memory: Bullish bias\n';
  } else if (brainMemoryScore < 30) {
    insights.sellSignal = true;
    insights.confidence += 15;
    insights.reason += '🧠 Memory: Bearish bias\n';
  }

  // === Self-Correcting Layer ===
  if (insights.confidence > 60) {
    brainMemoryScore = Math.min(brainMemoryScore + 2, 100);
  } else if (insights.confidence < 30) {
    brainMemoryScore = Math.max(brainMemoryScore - 2, 0);
  }

  insights.brainMemoryScore = brainMemoryScore;
  return insights;
}

async function getLiveBrainSignal() {
  try {
    const marketData = await priceFetcher.fetch();
    const analysis = analyzeMarket(marketData);
    logger.info('🧠 Brain Signal:', analysis);
    return analysis;
  } catch (err) {
    logger.error('⚠️ Brain Error:', err.message);
    return {
      buySignal: false,
      sellSignal: false,
      confidence: 0,
      reason: 'Error fetching market data',
    };
  }
}

module.exports = {
  analyzeMarket,
  getLiveBrainSignal,
};
