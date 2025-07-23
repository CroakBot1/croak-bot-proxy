// strategy.js
const logger = require('./logger');

let memory = {
    candleHistory: [],
    score: 0,
    lastDecision: null,
};

function analyzeCandle(candle) {
    const confidenceScore = computeConfidence(candle);
    memory.candleHistory.push({ ...candle, confidenceScore });
    if (memory.candleHistory.length > 1000) memory.candleHistory.shift(); // limit memory

    const sentiment = getVolumeMomentumSentiment(candle);
    const isTrap = trapDetectorV3(candle);
    const pattern = readCandlePattern(candle);

    const decision = computeFinalDecision({
        confidenceScore,
        sentiment,
        isTrap,
        pattern,
        score: memory.score,
    });

    memory.lastDecision = decision;

    logger.heartbeat(`Decision: ${decision}, Score: ${confidenceScore}`);
    return decision;
}

// === Core Modules Below ===

function computeConfidence(candle) {
    let score = 0;
    if (candle.volume > 1_000_000) score += 5;
    if (candle.close > candle.open) score += 3;
    if (Math.abs(candle.close - candle.open) / candle.open > 0.02) score += 2;
    return Math.min(10, score);
}

function getVolumeMomentumSentiment(candle) {
    const momentum = candle.close - candle.open;
    if (momentum > 0 && candle.volume > 500_000) return 'bullish';
    if (momentum < 0 && candle.volume > 500_000) return 'bearish';
    return 'neutral';
}

function trapDetectorV3(candle) {
    const wickSize = Math.abs(candle.high - candle.low);
    const bodySize = Math.abs(candle.close - candle.open);
    return bodySize < wickSize * 0.3;
}

function readCandlePattern(candle) {
    if (candle.open < candle.close && candle.low < candle.open) return 'hammer';
    if (candle.open > candle.close && candle.high > candle.open) return 'shooting_star';
    return 'neutral';
}

function computeFinalDecision({ confidenceScore, sentiment, isTrap, pattern, score }) {
    if (isTrap) return 'deny';

    if (pattern === 'hammer' && sentiment === 'bullish' && confidenceScore >= 7) return 'buy';
    if (pattern === 'shooting_star' && sentiment === 'bearish' && confidenceScore >= 7) return 'sell';

    if (confidenceScore >= 9 && sentiment === 'bullish') return 'buy';
    if (confidenceScore >= 9 && sentiment === 'bearish') return 'sell';

    return 'hold';
}

// === 🔥 Fire Commands Below (safe to call manually) ===

function fireBuy(reason = "Manual Trigger") {
    memory.lastDecision = 'buy';
    logger.warn(`🔥 Forced BUY activated! Reason: ${reason}`);
    return 'buy';
}

function fireSell(reason = "Manual Trigger") {
    memory.lastDecision = 'sell';
    logger.warn(`🔥 Forced SELL activated! Reason: ${reason}`);
    return 'sell';
}

module.exports = {
    analyzeCandle,
    memory,
    fireBuy,
    fireSell
};
