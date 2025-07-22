// ⛓️ Required Connections (always keep)
const { fetchMarketSnapshot } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variables
let brainMemoryScore = 50;
let lastConfirmedBuy = null;

// ------------------------------
// Core Versions and Brain Evolution Layers
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
    result.reasons.push('🧠 Bullish Memory Bias (V2-V5 Synced)');
  } else if (brainMemoryScore < 30) {
    result.sellSignal = true;
    result.confidence += 10;
    result.reasons.push('🧠 Bearish Memory Bias (V2-V5 Synced)');
  }

  return result;
}

// ------------------------------
// Smart Layers & Trap Detection
// ------------------------------
function candlePatternReader(candle) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  const green = candle.close > candle.open;
  const red = !green;
  const body = Math.abs(candle.close - candle.open);
  const totalRange = candle.high - candle.low;
  const bodyRatio = body / totalRange;

  result.green = green;
  result.red = red;
  result.bodySmall = bodyRatio < 0.2;
  result.size = bodyRatio > 0.7 ? 'large' : bodyRatio > 0.3 ? 'medium' : 'small';
  result.wickTop = candle.high - Math.max(candle.close, candle.open) > body * 1.5;
  result.wickBottom = Math.min(candle.close, candle.open) - candle.low > body * 1.5;

  if (green && result.size === 'large') {
    result.buySignal = true;
    result.confidence += 20;
    result.reasons.push('🟢 Large Green Candle');
  }
  if (red && result.size === 'large') {
    result.sellSignal = true;
    result.confidence += 20;
    result.reasons.push('🔴 Large Red Candle');
  }

  if (result.wickTop && result.bodySmall) {
    if (red) {
      result.sellSignal = true;
      result.confidence += 15;
      result.reasons.push('🪤 Wick Top Trap (Red Candle)');
    }
    if (green) {
      result.buySignal = true;
      result.confidence += 10;
      result.reasons.push('🪤 Wick Top Trap (Green Candle)');
    }
  }

  if (result.wickBottom && result.bodySmall) {
    if (green) {
      result.buySignal = true;
      result.confidence += 15;
      result.reasons.push('🪤 Wick Bottom Trap (Green Candle)');
    }
    if (red) {
      result.sellSignal = true;
      result.confidence += 10;
      result.reasons.push('🪤 Wick Bottom Trap (Red Candle)');
    }
  }

  return result;
}

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

function dynamicTradeFilter(trend, candle, volume) {
  const result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  const size = candle.size || 'medium';

  if (trend === 'up' && size === 'medium' && volume > 500000) {
    result.buySignal = true;
    result.confidence += 10;
    result.reasons.push('🔥 Hot Entry Opportunity');
  } else if (trend === 'down' && size === 'medium' && volume > 500000) {
    result.sellSignal = true;
    result.confidence += 10;
    result.reasons.push('❄️ Hot Exit Opportunity');
  }

  return result;
}

function sentimentDashboard() {
  return {
    confidenceModifier: 0,
    reasons: [],
  };
}

// ------------------------------
// Unified Market Analysis Engine
// ------------------------------
function analyzeMarket({ price, trend, volume, candle }) {
  let result = {
    buySignal: false,
    sellSignal: false,
    confidence: 0,
    reasons: [],
  };

  const veto = autoDenialVeto(candle);
  if (veto.vetoActive) return { ...result, reasons: veto.reasons, confidence: 0 };

  const risk = riskGuard(price, volume);
  if (risk.confidenceOverride !== null) {
    return { sellSignal: risk.sellSignal, buySignal: false, confidence: 0, reasons: risk.reasons };
  }

  for (const layer of [
    candlePatternReader(candle),
    volumeMomentumValidator(volume, trend),
    brainMemoryBias(),
    dynamicTradeFilter(trend, candle, volume),
    sentimentDashboard()
  ]) {
    if (layer.buySignal) result.buySignal = true;
    if (layer.sellSignal) result.sellSignal = true;
    result.confidence += layer.confidence || 0;
    result.reasons.push(...(layer.reasons || []));
  }

  result.confidence = Math.min(Math.max(result.confidence, 0), 100);

  if (result.confidence > 60) brainMemoryScore = Math.min(brainMemoryScore + 2, 100);
  else if (result.confidence < 30) brainMemoryScore = Math.max(brainMemoryScore - 2, 0);

  return result;
}

function shouldBuy(price) {
  return false;
}

function shouldSell(price) {
  return false;
}

// ------------------------------
// TP EXTENDER LOGIC
// ------------------------------
function tpExtender(decision, price) {
  if (decision.buySignal) {
    lastConfirmedBuy = {
      price,
      time: Date.now(),
      confidence: decision.confidence
    };
    logger.info("✅ BUY confirmed and saved by TP Extender:", lastConfirmedBuy);
    return { action: 'BUY', reasons: decision.reasons };
  }

  if (decision.sellSignal) {
    if (lastConfirmedBuy) {
      const gain = ((price - lastConfirmedBuy.price) / lastConfirmedBuy.price) * 100;
      logger.info(`📤 SELL triggered. Entry: $${lastConfirmedBuy.price}, Exit: $${price}, PnL: ${gain.toFixed(2)}%`);
      lastConfirmedBuy = null;
      return { action: 'SELL', reasons: decision.reasons };
    } else {
      logger.warn("⚠️ SELL signal ignored — no recent BUY was confirmed.");
      return { action: 'HOLD', reasons: ['🛑 No prior BUY — SELL denied'] };
    }
  }

  return { action: 'HOLD', reasons: decision.reasons };
}

// ------------------------------
// Quantum Heartbeat Engine
// ------------------------------
async function getLiveBrainSignal(symbol = 'ETHUSDT') {
  try {
    const marketData = await fetchMarketSnapshot(symbol);

    const trend = marketData.priceChangePercent > 0 ? 'up' : 'down';

    const parsedCandle = {
      open: marketData.candle.open,
      high: marketData.candle.high,
      low: marketData.candle.low,
      close: marketData.candle.close
    };

    const result = analyzeMarket({
      price: marketData.price,
      trend,
      volume: marketData.volume,
      candle: parsedCandle,
    });

    const final = tpExtender(result, marketData.price);
    logger.info(`📈 Signal: ${final.action} | ${final.reasons.join(' | ')}`);
    return final.action;
  } catch (err) {
    logger.error('❌ Signal Fetch Error:', err.message);
    return 'HOLD';
  }
}

// 📤 Module Exports — AYAW TANGTANGA NI
module.exports = {
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
