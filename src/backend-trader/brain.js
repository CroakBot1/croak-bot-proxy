// ⛓️ Required Connections (always keep)
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variable (used by memory scoring system)
let brainMemoryScore = 50;

// 📊 Decision-Making Functions (can be upgraded inside)
function analyzeMarket({ price, trend, volume, candle }) {
  // Your existing market analysis logic here...
  return 'HOLD'; // placeholder default
}

function shouldBuy(price) {
  // Your existing buy condition here...
  return price > 3500;  // example condition
}

function shouldSell(price) {
  // Your existing sell condition here...
  return price < 2850;  // example condition
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
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
