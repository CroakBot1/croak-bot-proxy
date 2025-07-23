// signal.js
const { executeBuy, executeSell } = require('./executor');
const logger = require('./logger');

async function handleSignal(req, res) {
  const { action, amount } = req.body;

  logger.info(`📡 Received signal: ${action} | Amount: ${amount} ETH`);

  if (!action || !amount) {
    return res.status(400).json({ error: 'Missing action or amount' });
  }

  let txHash;
  if (action === 'BUY') {
    txHash = await executeBuy(amount);
  } else if (action === 'SELL') {
    txHash = await executeSell(amount);
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (txHash) {
    res.json({ success: true, txHash });
  } else {
    res.status(500).json({ success: false, error: 'Execution failed' });
  }
}

module.exports = { handleSignal };
