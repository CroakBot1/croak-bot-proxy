// logger.js ✅ CROAK BOT LOGGER SYSTEM

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

// 🆕 Additional helpers (non-breaking)
function tradeSignal(type = "BUY", details = {}) {
  const emoji = type === "BUY" ? "🟢" : "🔴";
  console.log(`[${timestamp()}] [${emoji} ${type} SIGNAL]`, details);
}

function dryRunNotice(msg = "Dry run mode — no real trades will execute") {
  console.log(`[${timestamp()}] [💤 DRY RUN] ${msg}`);
}

function skipped(reason = "Unknown reason") {
  console.log(`[${timestamp()}] [⏭️ SKIPPED] ${reason}`);
}

module.exports = {
  info,
  warn,
  error,
  success,
  debug,
  heartbeat,
  executed,
  veto,
  tradeSignal,   // 🆕 Optional for clean trade signal logging
  dryRunNotice,  // 🆕 Optional notice for dry run environments
  skipped        // 🆕 Logs when a trade is intentionally skipped
};
