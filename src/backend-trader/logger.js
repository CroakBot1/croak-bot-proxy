// logger.js

function timestamp() {
  return new Date().toISOString();
}

function info(...args) {
  console.log(`[${timestamp()}] [ℹ️ INFO]`, ...args);
}

function warn(...args) {
  console.warn(`[${timestamp()}] [⚠️ WARN]`, ...args);
}

function error(...args) {
  console.error(`[${timestamp()}] [❌ ERROR]`, ...args);
}

function success(...args) {
  console.log(`[${timestamp()}] [✅ SUCCESS]`, ...args);
}

function debug(...args) {
  console.debug(`[${timestamp()}] [🧪 DEBUG]`, ...args);
}

function heartbeat(msg = "💓 CROAK Loop is alive") {
  console.log(`[${timestamp()}] [💓 HEARTBEAT] ${msg}`);
}

function executed(orderDetails = {}) {
  console.log(`[${timestamp()}] [🚀 TRADE EXECUTED]`, orderDetails);
}

function veto(reasonLines = []) {
  console.log(`[${timestamp()}] [🛑 VETO] No trade signal at this price.`);
  if (reasonLines.length > 0) {
    console.log(`🧠 Reason Breakdown:`);
    reasonLines.forEach((line) => {
      console.log(`  • ${line}`);
    });
  }
}

module.exports = {
  info,
  warn,
  error,
  success,
  debug,
  heartbeat,
  executed,
  veto, // ✅ ADDED
};
