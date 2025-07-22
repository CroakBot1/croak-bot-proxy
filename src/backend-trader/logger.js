function timestamp() {
  return new Date().toISOString();
}

// 🔁 Core Logs
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

// ✅ NEW: Veto Reason Logger — detailed breakdown
function veto(reasonObj = {}) {
  console.log(`[${timestamp()}] [🛑 VETO] No trade signal at this price.`);
  console.log(`🧠 Reason Breakdown:`);

  if (reasonObj.candle !== undefined)
    console.log(`  • Candle Reader: ${reasonObj.candle}`);
  if (reasonObj.trap !== undefined)
    console.log(`  • Trap Detector: ${reasonObj.trap}`);
  if (reasonObj.memoryScore !== undefined)
    console.log(`  • Brain Memory Score: ${reasonObj.memoryScore}`);
  if (reasonObj.veto !== undefined)
    console.log(`  • Auto-Denial Veto™: ${reasonObj.veto}`);
}

module.exports = {
  info,
  warn,
  error,
  success,
  debug,
  heartbeat,
  executed,
  veto // ✅ Include the new veto log
};
