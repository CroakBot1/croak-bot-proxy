// signal.js
const executor = require('./executor');

module.exports = async function handleSignal(req, res) {
  const { action, amount } = req.body;

  if (!action || !amount) {
    return res.status(400).json({ error: 'Missing action or amount' });
  }

  try {
    console.log(`📩 Signal received: ${action} ${amount} ETH`);

    let result;
    if (action === 'BUY') {
      result = await executor.buy(amount);
    } else if (action === 'SELL') {
      result = await executor.sell(amount);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ success: true, tx: result });
  } catch (err) {
    console.error('❌ Execution error:', err);
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
};
