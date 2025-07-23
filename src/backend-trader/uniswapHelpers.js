const fs = require('fs');
const path = require('path');
const LOG_FILE = path.join(__dirname, 'croakbot.log');

function timestamp() {
  return new Date().toISOString();
}

function writeToFile(level, message) {
  fs.appendFile(LOG_FILE, `[${timestamp()}] [${level}] ${message}\n`, () => {});
}

function info(...args) {
  const msg = args.join(' ');
  console.log(`[${timestamp()}] [ℹ️ INFO]`, msg);
  writeToFile('INFO', msg);
}

function error(...args) {
  const msg = args.join(' ');
  console.error(`[${timestamp()}] [❌ ERROR]`, msg);
  writeToFile('ERROR', msg);
}

module.exports = {
  info, error
};
