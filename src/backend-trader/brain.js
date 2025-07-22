// brain.js

// 🔒 Core brain dependencies
const logger = require('./logger'); // 🔒 DO NOT REMOVE
const { fetchMarketSnapshot } = require('./priceFetcher'); // 🔒 DO NOT REMOVE

// 🧠 Brain Memory Scoring System (placeholder, dynamic version optional)
let brainMemoryScore = 50;

// ✅ Decision logic for BUY
function shouldBuy(snapshot) {
  try {
    const price = snapshot.price;
    const trend = snapshot.trend || 'neutral';

    if (trend === 'bullish' && brainMemoryScore > 45) {
      logger.info('📈 BUY Signal: Trend bullish & memory score above 45');
      return true;
    }

    if (price < snapshot.avgPrice && brainMemoryScore >= 50) {
      logger.info('📉 BUY Signal: Price below average with healthy memory score');
      return true;
    }

    return false;
  } catch (err) {
    logger.error('💥 Error in shouldBuy logic:', err);
    return false;
  }
}

// ✅ Decision logic for SELL
function shouldSell(snapshot) {
  try {
    const price = snapshot.price;
    const trend = snapshot.trend || 'neutral';

    if (trend === 'bearish' && brainMemoryScore < 60) {
      logger.info('📉 SELL Signal: Trend bearish & memory score below 60');
      return true;
    }

    if (price > snapshot.avgPrice && brainMemoryScore < 50) {
      logger.info('📈 SELL Signal: Price above average with weak memory score');
      return true;
    }

    return false;
  } catch (err) {
    logger.error('💥 Error in shouldSell logic:', err);
    return false;
  }
}

// 🧠 Brain Evolution Memory Adjuster
function adjustBrainMemory(result) {
  if (result === 'win') {
    brainMemoryScore = Math.min(100, brainMemoryScore + 3);
  } else if (result === 'loss') {
    brainMemoryScore = Math.max(0, brainMemoryScore - 5);
  }

  logger.info(`🧠 Brain Memory Updated: ${brainMemoryScore}`);
}

// 📤 Export
module.exports = {
  shouldBuy,
  shouldSell,
  adjustBrainMemory,
  brainMemoryScore,
};
