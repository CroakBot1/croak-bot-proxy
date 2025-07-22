// 🔒 DO NOT REMOVE — dependencies used across brain system
const { fetchPrice, fetchMarketSnapshot } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variables
let brainMemoryScore = 50;
const TOTAL_LAYERS = 20000;

// === Individual Layer Handlers (assumed imported or defined elsewhere) ===
// Dummy placeholders — these should be real imported modules
function runRSILayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runMACDLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runSupportResistanceLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runTrapDetectionLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runMetaLearningLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runSelfEvolvingLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runDynamicTPStopLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runMultiTimeframeLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }
function runFinalJudgmentLayer({ id, candleData, state }) { return { type: 'HOLD', confidence: 1 }; }

// === Layer Execution Logic ===
function runSmartLayer({ id, candleData, state }) {
  if (id <= 50) return runRSILayer({ id, candleData, state });
  if (id <= 100) return runMACDLayer({ id, candleData, state });
  if (id <= 150) return runSupportResistanceLayer({ id, candleData, state });
  if (id <= 500) return runTrapDetectionLayer({ id, candleData, state });
  if (id <= 1000) return runMetaLearningLayer({ id, candleData, state });
  if (id <= 5000) return runSelfEvolvingLayer({ id, candleData, state });
  if (id <= 10000) return runDynamicTPStopLayer({ id, candleData, state });
  if (id <= 15000) return runMultiTimeframeLayer({ id, candleData, state });
  if (id <= 20000) return runFinalJudgmentLayer({ id, candleData, state });
  return null;
}

// === Aggregation of All Layer Signals ===
function evaluateAllLayers(candleData, state) {
  const allSignals = [];

  for (let i = 1; i <= TOTAL_LAYERS; i++) {
    const signal = runSmartLayer({ id: i, candleData, state });
    if (signal) allSignals.push(signal);
  }

  return mergeSignals(allSignals);
}

// === Signal Merging ===
function mergeSignals(signals) {
  let buyVotes = 0;
  let sellVotes = 0;
  let holdVotes = 0;
  let totalConfidence = 0;

  for (const signal of signals) {
    const confidence = signal.confidence || 1;
    totalConfidence += confidence;

    if (signal.type === 'BUY') buyVotes += confidence;
    else if (signal.type === 'SELL') sellVotes += confidence;
    else holdVotes += confidence;
  }

  const net = buyVotes - sellVotes;

  const dominantAction = net > 0.1 * totalConfidence
    ? 'BUY'
    : net < -0.1 * totalConfidence
    ? 'SELL'
    : 'HOLD';

  const strength = Math.abs(net) / totalConfidence;

  return {
    action: dominantAction,
    strength: Math.min(1, strength),
    confidenceScore: totalConfidence,
    votes: { buy: buyVotes, sell: sellVotes, hold: holdVotes }
  };
}

// === Optional Rule-Based Decision Logic ===
function analyzeMarket({ price, trend, volume, candle }) {
  return trend > 0.2 ? 'BUY' : trend < -0.2 ? 'SELL' : 'HOLD';
}

function shouldBuy(price) {
  return price % 2 < 1;
}

function shouldSell(price) {
  return price % 2 >= 1;
}

// === Core Brain Loop ===
async function runBrainCycle() {
  logger.info('⏳ Running diversified brain cycle...');

  try {
    const marketData = await fetchMarketSnapshot();
    const finalDecision = evaluateAllLayers(marketData, { memoryScore: brainMemoryScore });

    logger.info(`🧠 Brain Decision: ${finalDecision.action} (confidence: ${finalDecision.strength})`);

    return finalDecision;
  } catch (error) {
    logger.error('💥 Error during brain cycle:', error);
    return null;
  }
}

// === Public Interface ===
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

// === Export API ===
module.exports = {
  evaluateAllLayers,
  mergeSignals,
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
  runBrainCycle,
};
