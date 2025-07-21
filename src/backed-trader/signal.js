// signal.js

/**
 * Generates trading signal based on basic logic.
 * You can upgrade this with moving averages, RSI, sentiment, etc.
 *
 * @param {number} price - Current asset price
 * @param {object} state - Extra data (e.g. trend, volatility, memory)
 * @returns {string} - "buy", "sell", or "hold"
 */

function getSignal(price, state = {}) {
  const lastPrice = state.lastPrice || 0;

  // 🔍 Sample logic: very basic momentum
  if (price > lastPrice * 1.005) return 'buy';
  if (price < lastPrice * 0.995) return 'sell';
  return 'hold';
}

module.exports = { getSignal };
