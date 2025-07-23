// 61k.js
const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

router.post('/', async (req, res) => {
  const { action, amount } = req.body;

  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Use BUY or SELL.' });
  }

  logger.info(`📡 Signal: ${action} ${amount} ETH`);

  try {
    const price = await fetchPrice();
    const result = await executeTrade(action.toUpperCase(), amount);

    res.json({
      status: 'success',
      action,
      amount,
      price,
      txHash: result.hash || null
    });
  } catch (err) {
    logger.error('❌ Signal error:', err.message);
    res.status(500).json({ error: 'Signal execution failed.' });
  }
});

module.exports = router;
