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
  console.log(`[${timestamp()}] [🧪 DEBUG]`, ...args);
}

function heartbeat(msg = "💓 CROAK Loop is alive") {
  console.log(`[${timestamp()}] [💓 HEARTBEAT] ${msg}`);
}

// ✅ NEW: Trade execution log
function executed(action, price, txHash = '') {
  const tag = action === 'buy' ? '🟢 BUY EXECUTED' : '🔴 SELL EXECUTED';
  console.log(`[${timestamp()}] [${tag}] at $${price} ${txHash ? `| tx: ${txHash}` : ''}`);
}

module.exports = {
  info,
  warn,
  error,
  success,
  debug,
  heartbeat,
  executed, // ✅ Exported cleanly
};
