const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'log.txt');

function timestamp() {
  return new Date().toISOString();
}

function log(level, msg) {
  const logMsg = `[${timestamp()}] [${level}] ${msg}`;
  fs.appendFile(logFile, logMsg + '\n', () => {});
  console.log(logMsg);
}

module.exports = {
  info: (...args) => log('INFO', args.join(' ')),
  error: (...args) => log('ERROR', args.join(' ')),
};
