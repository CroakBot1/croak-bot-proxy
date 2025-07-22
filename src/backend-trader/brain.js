// ⛓️ Required Connections (always keep)
// 🔒 DO NOT REMOVE — dependencies used across brain system
const { fetchMarketSnapshot } = require('./priceFetcher'); // 🔒 DO NOT REMOVE
const logger = require('./logger'); // 🔒 DO NOT REMOVE

// 🧠 Core Brain Variables
let brainMemoryScore = 50;

// 🧠 Signal Logic Functions
function shouldBuy(price, trend, volume) {
  return price > 3500 && trend === 'bullish' && volume > 1000000;
}

function shouldSell(price, trend) {
  return price < 2850 && trend === 'bearish';
}

function getSignal({ price, trend, volume }) {
  if (shouldBuy(price, trend, volume)) return 'BUY';
  if (shouldSell(price, trend)) return 'SELL';
  return 'HOLD';
}

// 🧠 Main Check Execution
function runBrainCheck() {
  logger.info('⏳ Running 61K strategy check...');
  try {
    fetchMarketSnapshot()
      .then((data) => {
        const signal = getSignal(data);

        if (signal === 'BUY') {
          logger.info('🟢 BUY signal confirmed by brain logic.');
        } else if (signal === 'SELL') {
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

// 🧠 Manual Triggers
function manualTriggerBuy() {
  logger.info('🟢 Manual BUY signal triggered by user.');
}

function manualTriggerSell() {
  logger.warn('🔴 Manual SELL signal triggered by user.');
}

// 🧠 Brain Score Management
function adjustBrainMemory(scoreChange) {
  brainMemoryScore += scoreChange;
  brainMemoryScore = Math.max(0, Math.min(brainMemoryScore, 100));
  logger.info(`🧠 Updated Brain Memory Score: ${brainMemoryScore}`);
}

// ✅ Export for backend usage
module.exports = {
  runBrainCheck,
  manualTriggerBuy,
  manualTriggerSell,
  adjustBrainMemory,
  shouldBuy,
  shouldSell,
  getSignal,
};

// ✅ Attach to window for frontend GUI
if (typeof window !== 'undefined') {
  window.CROAK_BRAIN = {
    runBrainCheck,
    manualTriggerBuy,
    manualTriggerSell,
    adjustBrainMemory,
    shouldBuy,
    shouldSell,
    getSignal,
  };
}
