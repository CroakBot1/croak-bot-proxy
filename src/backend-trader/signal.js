// signal.js

/**
 * Generates trading signal based on basic momentum logic.
 *
 * @param {number} price - Current price
 * @param {object} state - Custom state tracker (e.g., memory, trends)
 * @returns {string} "buy", "sell", or "hold"
 */
function getSignal(price, state = {}) {
  const lastPrice = state.lastPrice || 0;

  if (price > lastPrice * 1.005) return 'buy';
  if (price < lastPrice * 0.995) return 'sell';
  return 'hold';
}

module.exports = { getSignal };
