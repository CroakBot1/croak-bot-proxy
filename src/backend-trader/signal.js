const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// ✅ Handle POST /signal
router.post('/', async (req, res) => {
  const { action, amount } = req.body;

  logger.info(`📡 Signal received: ${action} ${amount} ETH`);

  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL.' });
  }

  try {
    const result = await executeTrade(action.toUpperCase(), amount);
    const price = await fetchPrice();

    res.json({
      status: 'success',
      action,
      amount,
      result,
      price
    });
  } catch (err) {
    logger.error('❌ Signal handler error:', err);
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
});

module.exports = router;
