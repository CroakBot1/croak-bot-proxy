// ⛓️ Required Connections (always keep)
// 🔒 DO NOT REMOVE — dependencies used across brain system
const { fetchMarketSnapshot } = require('./priceFetcher'); // 🔒 DO NOT REMOVE
const logger = require('./logger'); // 🔒 DO NOT REMOVE

// 🧠 Core Brain Variables
let brainMemoryScore = 50;

// 🧠 Core Logic Functions
function runBrainCheck() {
  logger.info('⏳ Running 61K strategy check...');
  try {
    fetchMarketSnapshot()
      .then((data) => {
        const { price, trend, volume } = data;

        if (price > 3500 && trend === 'bullish' && volume > 1000000) {
          logger.info('🟢 BUY signal confirmed by brain logic.');
        } else if (price < 2850 && trend === 'bearish') {
          logger.warn('🔴 SELL signal confirmed by brain logic.');
        } else {
          logger.info('🟡 No action taken. Market conditions neutral.');
        }
      })
      .catch((err) => {
        logger.error('💥 Error fetching market snapshot:', err);
      });
  } catch (err) {
    logger.error('💥 Error during brain check execution:', err);
  }
}

function manualTriggerBuy() {
  logger.info('🟢 Manual BUY signal triggered by user.');
}

function manualTriggerSell() {
  logger.warn('🔴 Manual SELL signal triggered by user.');
}

// 🧠 Memory & Scoring System
function adjustBrainMemory(scoreChange) {
  brainMemoryScore += scoreChange;
  brainMemoryScore = Math.max(0, Math.min(brainMemoryScore, 100));
  logger.info(`🧠 Updated Brain Memory Score: ${brainMemoryScore}`);
}

// ✅ Export for backend use
module.exports = {
  runBrainCheck,
  manualTriggerBuy,
  manualTriggerSell,
  adjustBrainMemory,
};

// ✅ Setup for frontend if window exists
if (typeof window !== 'undefined') {
  window.CROAK_BRAIN = {
    runBrainCheck,
    manualTriggerBuy,
    manualTriggerSell,
    adjustBrainMemory,
  };
}
