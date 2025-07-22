// ⛓️ Required Connections (always keep)
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variables
let brainMemoryScore = 50; // 61K V2 Brain Memory Sync base score
let lastConfirmedBuy = null; // TP Extender will track this

// ------------------------------
// Layer: CANDLE READER — TRILLIONS INTELLIGENCE LAYER
// ------------------------------
function candlePatternReader(candle) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  // Candle Pattern Reader Layer + Candle Confidence Score System™
  if (candle.green && candle.size === 'large') {
    result.buySignal = true;
    result.confidence += 20;
    result.reasons.push('🟢 Large Green Candle');
  }
  if (candle.red && candle.size === 'large') {
    result.sellSignal = true;
    result.confidence += 20;
    result.reasons.push('🔴 Large Red Candle');
  }

  // Candle Trap Filter Layer
  if (candle.wickTop && candle.bodySmall) {
    if (candle.red) {
      result.sellSignal = true;
      result.confidence += 15;
      result.reasons.push('🪤 Wick Top Trap (Red Candle)');
    }
    if (candle.green) {
      result.buySignal = true;
      result.confidence += 10;
      result.reasons.push('🪤 Wick Top Trap (Green Candle)');
    }
  }
  if (candle.wickBottom && candle.bodySmall) {
    if (candle.green) {
      result.buySignal = true;
      result.confidence += 15;
      result.reasons.push('🪤 Wick Bottom Trap (Green Candle)');
    }
    if (candle.red) {
      result.sellSignal = true;
      result.confidence += 10;
      result.reasons.push('🪤 Wick Bottom Trap (Red Candle)');
    }
  }

  return result;
}

// ------------------------------
// Layer: Volume + Momentum Validator & Smart Entry/Exit Filters
// ------------------------------
function volumeMomentumValidator(volume, trend) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  if (volume > 1000000 && trend === 'up') {
    result.buySignal = true;
    result.confidence += 15;
    result.reasons.push('🚀 High Volume + Uptrend');
  } else if (volume > 1000000 && trend === 'down') {
    result.sellSignal = true;
    result.confidence += 15;
    result.reasons.push('⚠️ High Volume + Downtrend');
  }

  return result;
}

// ------------------------------
// Layer: Risk Guard Layer v2 – Anti-Bogok BUY Protection™
// ------------------------------
function riskGuard(price, volume) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidenceOverride: null,
    reasons: [],
  };

  if (price < 1 || volume < 50000) {
    result.sellSignal = true;
    result.confidenceOverride = 0;
    result.reasons.push('🛑 Risk Guard: Low Price or Low Volume');
  }

  return result;
}

// ------------------------------
// Layer: Auto-Denial Veto™ – Final Judgment Layer
// ------------------------------
function autoDenialVeto(candle) {
  const result = {
    vetoActive: false,
    reasons: [],
  };

  if (candle.freakSpike || candle.absurdGap) {
    result.vetoActive = true;
    result.reasons.push('🚫 Auto-Denial Veto™ – Abnormal Candle Detected');
  }

  return result;
}

// ------------------------------
// Layer: 61K Quantum Core Brain & Memory Sync Layers (V2 to V5)
// ------------------------------
function brainMemoryBias() {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  if (brainMemoryScore > 70) {
    result.buySignal = true;
    result.confidence += 10;
    result.reasons.push('🧠 Bullish Memory Bias');
  } else if (brainMemoryScore < 30) {
    result.sellSignal = true;
    result.confidence += 10;
    result.reasons.push('🧠 Bearish Memory Bias');
  }

  return result;
}

// ------------------------------
// Layer: Dynamic Trade Filter, Hot Entry / Exit Scanners & Market Optimizer
// ------------------------------
function dynamicTradeFilter(trend, candle, volume) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  if (trend === 'up' && candle.size === 'medium' && volume > 500000) {
    result.buySignal = true;
    result.confidence += 10;
    result.reasons.push('🔥 Hot Entry Opportunity');
  } else if (trend === 'down' && candle.size === 'medium' && volume > 500000) {
    result.sellSignal = true;
    result.confidence += 10;
    result.reasons.push('❄️ Hot Exit Opportunity');
  }

  return result;
}

// ------------------------------
// Layer: Visual Sentiment Dashboard (stub for future extension)
// ------------------------------
function sentimentDashboard() {
  return {
    confidenceModifier: 0,
    reasons: [],
  };
}

// ------------------------------
// Layer: Full Market Analysis Integration
// ------------------------------
function analyzeMarket({ price, trend, volume, candle }) {
  let finalInsights = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reason: [],
  };

  const veto = autoDenialVeto(candle);
  if (veto.vetoActive) {
    finalInsights.reason.push(...veto.reasons);
    finalInsights.confidence = 0;
    return finalInsights;
  }

  const risk = riskGuard(price, volume);
  if (risk.confidenceOverride !== null) {
    finalInsights.sellSignal = risk.sellSignal;
    finalInsights.confidence = risk.confidenceOverride;
    finalInsights.reason.push(...risk.reasons);
    return finalInsights;
  }

  const candleResults = candlePatternReader(candle);
  if (candleResults.buySignal) finalInsights.buySignal = true;
  if (candleResults.sellSignal) finalInsights.sellSignal = true;
  finalInsights.confidence += candleResults.confidence;
  finalInsights.reason.push(...candleResults.reasons);

  const volumeResults = volumeMomentumValidator(volume, trend);
  if (volumeResults.buySignal) finalInsights.buySignal = true;
  if (volumeResults.sellSignal) finalInsights.sellSignal = true;
  finalInsights.confidence += volumeResults.confidence;
  finalInsights.reason.push(...volumeResults.reasons);

  const brainResults = brainMemoryBias();
  if (brainResults.buySignal) finalInsights.buySignal = true;
  if (brainResults.sellSignal) finalInsights.sellSignal = true;
  finalInsights.confidence += brainResults.confidence;
  finalInsights.reason.push(...brainResults.reasons);

  const dynamicResults = dynamicTradeFilter(trend, candle, volume);
  if (dynamicResults.buySignal) finalInsights.buySignal = true;
  if (dynamicResults.sellSignal) finalInsights.sellSignal = true;
  finalInsights.confidence += dynamicResults.confidence;
  finalInsights.reason.push(...dynamicResults.reasons);

  const sentimentResults = sentimentDashboard();
  finalInsights.confidence += sentimentResults.confidenceModifier;
  finalInsights.reason.push(...sentimentResults.reasons);

  finalInsights.confidence = Math.min(Math.max(finalInsights.confidence, 0), 100);

  if (finalInsights.confidence > 60) {
    brainMemoryScore = Math.min(brainMemoryScore + 2, 100);
  } else if (finalInsights.confidence < 30) {
    brainMemoryScore = Math.max(brainMemoryScore - 2, 0);
  }

  finalInsights.brainMemoryScore = brainMemoryScore;
  finalInsights.reasonLog = finalInsights.reason.join(' | ');

  return finalInsights;
}

// ------------------------------
// TP EXTENDER LOGIC: Handles SELL only if there's a confirmed BUY
// ------------------------------
function tpExtender(decision) {
  if (decision.buySignal) {
    lastConfirmedBuy = {
      time: Date.now(),
      price: decision.price,
      confidence: decision.confidence,
    };
    return { action: 'BUY', reasons: decision.reasonLog };
  }

  if (decision.sellSignal && lastConfirmedBuy) {
    return { action: 'SELL', reasons: decision.reasonLog };
  }

  return { action: 'HOLD', reasons: decision.reasonLog };
}

// ------------------------------
// Public Interface: Live Brain Signal
// ------------------------------
async function getLiveBrainSignal(symbol = 'ETHUSDT') {
  try {
    const priceData = await fetchPrice(symbol);

    const dummyMarket = {
      price: priceData.price,
      trend: 'up',
      volume: priceData.volume || 1000000,
      candle: {
        green: true,
        red: false,
        size: 'large',
        wickTop: false,
        wickBottom: false,
        bodySmall: false,
        freakSpike: false,
        absurdGap: false,
      },
    };

    const result = analyzeMarket(dummyMarket);
    const final = tpExtender({ ...result, price: priceData.price });

    logger.info(`📈 Signal: ${final.action} | ${final.reasons}`);
    return final.action;
  } catch (err) {
    logger.error('❌ Signal Fetch Error:', err.message);
    return 'HOLD';
  }
}

// ------------------------------
// Module Exports — AYAW TANGTANGA NI
// ------------------------------
module.exports = {
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
