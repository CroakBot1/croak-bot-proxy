// brain.js
// 🧠 61K Strategy Brain — Smart Signal Trigger with Executor Integration

const axios = require('axios');
const logger = require('./logger');

// === Configurable Thresholds ===
const BUY_THRESHOLD = 2850;
const SELL_THRESHOLD = 3500;
const EXECUTION_AMOUNT = 1.5; // editable trade amount

// === Decision Logic ===
function shouldBuy(price) {
  return price < BUY_THRESHOLD; // BUY if cheap
}

function shouldSell(price) {
  return price > SELL_THRESHOLD; // SELL if expensive
}

// === Signal Handler ===
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

// === Exported for external use ===
module.exports = {
  handleSignal,
  shouldBuy,
  shouldSell,
};
