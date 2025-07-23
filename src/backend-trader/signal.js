const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

router.post('/signal', async (req, res) => {
  const { action, amount } = req.body;

  logger.info(`📡 Received signal: ${action} ${amount} ETH`);

  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Use BUY or SELL.' });
  }

  try {
    const txResult = await executeTrade(action.toUpperCase(), amount);
    const marketPrice = await fetchPrice();

    res.json({
      status: 'success',
      action,
      txResult,
      price: marketPrice
    });
  } catch (err) {
    logger.error('❌ Signal Error:', err);
    res.status(500).json({ error: 'Signal failed', details: err.message });
  }
});

module.exports = router;
