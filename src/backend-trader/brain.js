// 🧠 CROAK BOT V5 – Full Brain Module
// Handles trade decisions based on price, traps, memory, and multi-layer signals

const brainMemory = {
  lastSignal: null,
  confidenceScore: 0,
  scoreHistory: [],
  recentPrices: [],
  trapDetected: false,
};

function updateMemory(score) {
  brainMemory.confidenceScore = score;
  brainMemory.scoreHistory.push(score);
  if (brainMemory.scoreHistory.length > 100) {
    brainMemory.scoreHistory.shift();
  }
}

function detectTrap(prices) {
  const recent = prices.slice(-5);
  const spikes = recent.filter((v, i, a) =>
    i > 0 && Math.abs(v - a[i - 1]) / a[i - 1] > 0.015
  );
  return spikes.length >= 2;
}

function getSignalFromPrice(currentPrice, prices) {
  const len = prices.length;
  if (len < 2) return { signal: 'hold', confidence: 0.4 };

  const lastPrice = prices[len - 2];
  const change = (currentPrice - lastPrice) / lastPrice;

  if (change > 0.005) return { signal: 'buy', confidence: 0.7 };
  if (change < -0.005) return { signal: 'sell', confidence: 0.7 };
  return { signal: 'hold', confidence: 0.5 };
}

function analyze(price) {
  // Push to memory
  brainMemory.recentPrices.push(price);
  if (brainMemory.recentPrices.length > 50) {
    brainMemory.recentPrices.shift();
  }

  // Trap detection
  const trap = detectTrap(brainMemory.recentPrices);
  brainMemory.trapDetected = trap;

  // Signal logic
  const { signal, confidence } = getSignalFromPrice(price, brainMemory.recentPrices);

  // Trap overrides signal
  const finalSignal = trap ? 'hold' : signal;
  const finalConfidence = trap ? 0.3 : confidence;

  // Update memory
  updateMemory(finalConfidence);
  brainMemory.lastSignal = finalSignal;

  return {
    signal: finalSignal,
    confidence: finalConfidence,
    trapDetected: trap,
  };
}

module.exports = {
  analyze,
  memory: brainMemory,
};
