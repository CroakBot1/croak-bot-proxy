// brain.js
// 🧠 61K Strategy Brain — Smart Signal Trigger with Executor Integration

const axios = require('axios');
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// === Configurable Thresholds ===
const BUY_THRESHOLD = 2850;
const SELL_THRESHOLD = 3500;
const EXECUTION_AMOUNT = 1.5; // editable trade amount

// 🧠 Core Brain Variable (used by memory scoring system)
let brainMemoryScore = 50;

// === Decision Logic ===
function shouldBuy(price) {
  return price < BUY_THRESHOLD; // BUY if cheap
}

function shouldSell(price) {
  return price > SELL_THRESHOLD; // SELL if expensive
}

// === Smart Market Analyzer (expandable) ===
function analyzeMarket({ price, trend, volume, candle }) {
  // Placeholder for future smart analysis logic
  return price;
}

// === Signal Handler with Executor Integration ===
async function handleSignal(price) {
  logger.info(`🔎 Checking price: $${price}`);

  if (shouldBuy(price)) {
    logger.info("📈 BUY signal detected.");

    try {
      await axios.post("http://localhost:3000/api/execute", {
        type: "buy",
        amount: EXECUTION_AMOUNT,
      });
      logger.info("✅ BUY executed.");
    } catch (err) {
      logger.error("❌ Failed to execute BUY:", err.message);
    }
  }

  else if (shouldSell(price)) {
    logger.info("📉 SELL signal detected.");

    try {
      await axios.post("http://localhost:3000/api/execute", {
        type: "sell",
        amount: EXECUTION_AMOUNT,
      });
      logger.info("✅ SELL executed.");
    } catch (err) {
      logger.error("❌ Failed to execute SELL:", err.message);
    }
  }

  else {
    logger.info("⏸ No clear signal. Waiting...");
  }
}

// === Public Signal Interface ===
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

// === Exports — AYAW TANGTANGA NI ===
module.exports = {
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
  handleSignal,
};
