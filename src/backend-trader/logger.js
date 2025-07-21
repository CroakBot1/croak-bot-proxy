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

module.exports = {
  info,
  warn,
  error,
  success,
  debug,
  heartbeat,
};
