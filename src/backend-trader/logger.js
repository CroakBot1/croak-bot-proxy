const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'croakbot.log');

function timestamp() {
  return new Date().toISOString();
}

function logToFile(level, message) {
  const line = `[${timestamp()}] [${level}] ${message}\n`;
  fs.appendFile(LOG_FILE, line, (err) => {
    if (err) console.error("❌ Log file error:", err);
  });
}

function info(...args) {
  const msg = args.join(' ');
  console.log(`[${timestamp()}] [ℹ️ INFO]`, msg);
  logToFile('INFO', msg);
}

function warn(...args) {
  const msg = args.join(' ');
  console.warn(`[${timestamp()}] [⚠️ WARN]`, msg);
  logToFile('WARN', msg);
}

function error(...args) {
  const msg = args.join(' ');
  console.error(`[${timestamp()}] [❌ ERROR]`, msg);
  logToFile('ERROR', msg);
}

module.exports = { info, warn, error };
