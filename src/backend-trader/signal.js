const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const logger = require('./logger');

// ✅ Receive POST from frontend
router.post('/signal', async (req, res) => {
  const { action, amount } = req.body;

  logger.info(`📡 Signal received: ${action} ${amount} ETH`);

  // Validate action
  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL.' });
  }

  // Validate amount
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'Invalid amount. Must be a number > 0.' });
  }

  try {
    // 🔁 Execute real Uniswap trade
    const txResult = await executeTrade(action.toUpperCase(), amount);

    if (!txResult.success) {
      logger.error('❌ Trade failed:', txResult.error);
      return res.status(500).json({ status: 'fail', error: txResult.error });
    }

    // ✅ Respond with transaction hash
    res.json({
      status: 'success',
      message: `Trade executed`,
      txHash: txResult.txHash,
      action,
      amount
    });

  } catch (err) {
    logger.error('💥 Error in /signal:', err.message);
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
});

module.exports = router;
