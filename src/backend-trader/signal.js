// signal.js

let currentSignal = null;

function setSignal(signal) {
  currentSignal = signal;
}

function getStoredSignal() {
  return currentSignal;
}

function getSignal(price, state = {}) {
  const lastPrice = state.lastPrice || 0;

  if (price > lastPrice * 1.005) return 'buy';
  if (price < lastPrice * 0.995) return 'sell';
  return 'hold';
}

module.exports = {
  getSignal,
  setSignal,
  getStoredSignal,
};
