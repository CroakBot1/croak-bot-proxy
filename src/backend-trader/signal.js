// signal.js

/**
 * Trading signal logic module.
 */

let currentSignal = null; // 🧠 Store last signal for external tracking

function setSignal(signal) {
  currentSignal = signal;
}

function getStoredSignal() {
  return currentSignal;
}

function getSignal(price, state = {}) {
  const lastPrice = state.lastPrice || 0;

  // 🔍 Sample logic: very basic momentum
  if (price > lastPrice * 1.005) return 'buy';
  if (price < lastPrice * 0.995) return 'sell';
  return 'hold';
}

module.exports = {
  getSignal,
  setSignal,
  getStoredSignal,
};
