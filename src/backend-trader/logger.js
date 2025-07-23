// logger.js
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'croakbot.log');

function timestamp() {
  return new Date().toISOString();
}

function writeToFile(level, message) {
  const logLine = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFile(LOG_FILE, logLine, (err) => {
    if (err) console.error("❌ Failed to write log file:", err);
  });
}

function info(...args) {
  const msg = args.join(' ');
  console.log(`[${timestamp()}] [ℹ️ INFO]`, msg);
  writeToFile('ℹ️ INFO', msg);
}

function warn(...args) {
  const msg = args.join(' ');
  console.warn(`[${timestamp()}] [⚠️ WARN]`, msg);
  writeToFile('⚠️ WARN', msg);
}

function error(...args) {
  const msg = args.join(' ');
  console.error(`[${timestamp()}] [❌ ERROR]`, msg);
  writeToFile('❌ ERROR', msg);
}

function heartbeat(msg = "💓 CROAK Loop is alive") {
  const log = `[${timestamp()}] [💓 HEARTBEAT] ${msg}`;
  console.log(log);
  writeToFile('💓 HEARTBEAT', msg);
}

module.exports = {
  info,
  warn,
  error,
  heartbeat
};
