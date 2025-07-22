// brain.js

// 🔗 Dependencies
const axios = require("axios");
const { fetchMarketSnapshot } = require("./priceFetcher"); // 🔒 DO NOT REMOVE
const logger = require("./logger"); // 🔒 DO NOT REMOVE

// 🧠 Core Config
const EXECUTION_AMOUNT = 0.01;
const INTERVAL = 5000;
let brainMemoryScore = 50;

// 📊 Thresholds
const BUY_THRESHOLD = 40;
const SELL_THRESHOLD = 60;

// 🔧 Manual Force Mode (for testing only)
const FORCE_BUY = true;
const FORCE_SELL = false;

// === Core Decision Functions ===
function shouldBuy(price) {
  return brainMemoryScore <= BUY_THRESHOLD;
}

function shouldSell(price) {
  return brainMemoryScore >= SELL_THRESHOLD;
}

// === Signal Handler ===
async function handleSignal(price) {
  logger.info(`🔎 Checking price: $${price}`);

  if (FORCE_BUY || shouldBuy(price)) {
    logger.info("📈 BUY signal detected (forced or real).");

    try {
      await axios.post("http://localhost:3000/api/execute", {
        type: "buy",
        amount: EXECUTION_AMOUNT,
      });
      logger.info("✅ BUY executed.");
    } catch (err) {
      logger.error("❌ Failed to execute BUY:", err.message);
    }
    return;
  }

  if (FORCE_SELL || shouldSell(price)) {
    logger.info("📉 SELL signal detected (forced or real).");

    try {
      await axios.post("http://localhost:3000/api/execute", {
        type: "sell",
        amount: EXECUTION_AMOUNT,
      });
      logger.info("✅ SELL executed.");
    } catch (err) {
      logger.error("❌ Failed to execute SELL:", err.message);
    }
    return;
  }

  logger.info("⏸ No clear signal. Waiting...");
}

// === Strategy Runner Loop ===
async function runStrategyLoop() {
  logger.info("🤖 Brain strategy loop initiated...");

  while (true) {
    try {
      const market = await fetchMarketSnapshot();
      const price = parseFloat(market.price);
      await handleSignal(price);
    } catch (err) {
      logger.error("💥 Error during price check:", err.message);
    }

    await new Promise((res) => setTimeout(res, INTERVAL));
  }
}

// === Launch Brain ===
runStrategyLoop();
