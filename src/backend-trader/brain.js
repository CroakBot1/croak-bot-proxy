// brain.js 🧠
// ==============================
// 61K QUANTUM STRATEGY CORE — ULTRA INTEGRATED VERSION
// DO NOT REMOVE ANY SECTION WITHOUT SYSTEM CLEARANCE

// ⛓️ Required Connections (always keep)
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// 🧠 Core Brain Variables
let brainMemoryScore = 50;
let lastSignal = 'HOLD';
let lastPrice = 0;
let tpExtended = false;
let blockBuy = false;

// ===========================
// 🔬 Utility Filters & Validators
// ===========================
function volumeMomentumValidator({ volume, momentum }) {
  return volume > 70 && momentum > 65;
}

function candlePatternReader(candle) {
  return ['bullish_engulfing', 'hammer', 'morning_star'].includes(candle.pattern);
}

function candleConfidenceScoreSystem(candle) {
  let score = 0;
  const patternScores = {
    bullish_engulfing: 30,
    hammer: 20,
    morning_star: 25,
  };
  score += patternScores[candle.pattern] || 0;
  if (candle.strongClose) score += 15;
  if (candle.volumeSpike) score += 10;
  return score;
}

function trapDetectionUltra(priceData) {
  return priceData.spike || priceData.suddenDrop || priceData.fomoTrap || priceData.reversalAlert;
}

function autoDenialVetoLayer(signal, priceData) {
  if (trapDetectionUltra(priceData)) {
    logger.warn('🚫 AUTO-DENIAL VETO™ — Trade denied due to trap signature.');
    return 'HOLD';
  }
  return signal;
}

function tpExtenderTrillions(signal, price) {
  if (signal === 'SELL' && !tpExtended && brainMemoryScore > 60) {
    tpExtended = true;
    blockBuy = true;
    logger.info('🧱 TP EXTENDER activated: HOLD SELL for extended profit. BUY temporarily blocked.');
    return 'HOLD';
  } else if (signal === 'SELL' && tpExtended) {
    tpExtended = false;
    blockBuy = false;
    return 'SELL';
  }
  return signal;
}

function smartEntryFilterLayer(priceData) {
  return priceData.trend === 'up' && volumeMomentumValidator(priceData);
}

function smartExitFilterLayer(priceData) {
  return priceData.trend === 'down' || priceData.weakCandle;
}

function dynamicTradeFilter(priceData) {
  return priceData.riskScore < 50 && !priceData.highLatency;
}

function hotEntryScanner(priceData) {
  return priceData.hotEntry && candlePatternReader(priceData.candle);
}

function hotExitScanner(priceData) {
  return priceData.hotExit || priceData.candle.reversal;
}

function reversalTrapDetector(priceData) {
  return priceData.momentumFlip && priceData.candle.reversal;
}

function invertedMomentumDenial(priceData) {
  return priceData.invertedMomentum || priceData.staleVolume;
}

// ===========================
// 🧠 ANALYZE MARKET DECISION
// ===========================
function analyzeMarket(priceData) {
  const candleScore = candleConfidenceScoreSystem(priceData.candle);
  const allowBuy = smartEntryFilterLayer(priceData) && candleScore >= 40 && !blockBuy && !invertedMomentumDenial(priceData);
  const allowSell = smartExitFilterLayer(priceData) || hotExitScanner(priceData) || candleScore < 20 || reversalTrapDetector(priceData);

  let signal = 'HOLD';

  if (allowBuy && dynamicTradeFilter(priceData)) {
    signal = 'BUY';
  } else if (allowSell) {
    signal = 'SELL';
  }

  // Advanced Layers
  signal = autoDenialVetoLayer(signal, priceData);
  signal = tpExtenderTrillions(signal, priceData.price);

  // Memory Influence
  if (signal === 'BUY') brainMemoryScore += 2;
  if (signal === 'SELL') brainMemoryScore -= 2;

  brainMemoryScore = Math.max(0, Math.min(100, brainMemoryScore));

  lastSignal = signal;
  lastPrice = priceData.price;

  return signal;
}

// ===========================
// ✅ BUY / SELL DECISIONS
// ===========================
function shouldBuy(price) {
  return lastSignal === 'BUY';
}

function shouldSell(price) {
  return lastSignal === 'SELL';
}

// ===========================
// 📡 PUBLIC BRAIN SIGNAL ENTRYPOINT
// ===========================
async function getLiveBrainSignal(symbol = 'ETHUSDT') {
  const priceData = await fetchPrice(symbol);
  const decision = analyzeMarket(priceData);

  if (decision === 'BUY') logger.info(`🟢 BUY signal at ${priceData.price}`);
  else if (decision === 'SELL') logger.info(`🔴 SELL signal at ${priceData.price}`);
  else logger.info(`🟡 HOLD signal at ${priceData.price}`);

  return decision;
}

// 📤 Export Interface
module.exports = {
  analyzeMarket,
  shouldBuy,
  shouldSell,
  getLiveBrainSignal,
};
