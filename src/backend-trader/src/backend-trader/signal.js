// signal.js

let tradeSignal = null;

function setTradeSignal(signal) {
  tradeSignal = signal;
}

function getTradeSignal() {
  return tradeSignal;
}

module.exports = {
  setTradeSignal,
  getTradeSignal,
};
