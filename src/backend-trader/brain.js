// brain.js

// 🔒 Core brain dependencies
const logger = require('./logger'); // 🔒 DO NOT REMOVE
const { fetchMarketSnapshot } = require('./priceFetcher'); // 🔒 DO NOT REMOVE

// 🧠 Brain Memory Scoring System
let brainMemoryScore = 50;

// ⛓️ Internal state to track unfulfilled actions
let lastSellAttempt = null;

// ✅ BUY Decision Logic
function shouldBuy(snapshot) {
  try {
    const price = snapshot.price;
    const trend = snapshot.trend || 'neutral';

    // 🟢 Standard Buy Logic
    if (trend === 'bullish' && brainMemoryScore > 45) {
      logger.info('📈 BUY Signal: Bullish trend with strong memory');
      return true;
    }

    if (price < snapshot.avgPrice && brainMemoryScore >= 50) {
      logger.info('📉 BUY Signal: Undervalued price with healthy memory');
      return true;
    }

    // ⚠️ Force Buy if previous SELL attempt wasn't fulfilled
    if (lastSellAttempt && !lastSellAttempt.fulfilled && brainMemoryScore >= 40) {
      logger.warn('⚠️ FORCED BUY: Last SELL was not fulfilled, taking recovery position');
      return true;
    }

    return false;
  } catch (err) {
    logger.error('💥 Error in shouldBuy:', err);
    return false;
  }
}

// ✅ SELL Decision Logic
function shouldSell(snapshot) {
  try {
    const price = snapshot.price;
    const trend = snapshot.trend || 'neutral';

    if (trend === 'bearish' && brainMemoryScore < 60) {
      logger.info('📉 SELL Signal: Bearish trend with weak memory');
      return true;
    }

    if (price > snapshot.avgPrice && brainMemoryScore < 50) {
      logger.info('📈 SELL Signal: Overvalued price with fragile memory');
      return true;
    }

    return false;
  } catch (err) {
    logger.error('💥 Error in shouldSell:', err);
    return false;
  }
}

// 🧠 Brain Memory Adjuster
function adjustBrainMemory(result) {
  if (result === 'win') {
    brainMemoryScore = Math.min(100, brainMemoryScore + 3);
  } else if (result === 'loss') {
    brainMemoryScore = Math.max(0, brainMemoryScore - 5);
  }

  logger.info(`🧠 Brain Memory Updated: ${brainMemoryScore}`);
}

// 📌 Track last SELL signal attempt
function registerSellAttempt({ fulfilled }) {
  lastSellAttempt = {
    fulfilled: !!fulfilled,
    timestamp: Date.now(),
  };

  logger.info(`🗂️ Registered SELL attempt - Fulfilled: ${fulfilled}`);
}

// 📤 Exports
module.exports = {
  shouldBuy,
  shouldSell,
  adjustBrainMemory,
  registerSellAttempt,
  brainMemoryScore,
};
