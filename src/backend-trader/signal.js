const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const { fetchPrice } = require('./priceFetcher');
const logger = require('./logger');

// ✅ Endpoint: POST /signal
router.post('/', async (req, res) => {
  const { action, amount } = req.body;

  logger.info(`📡 Received signal from frontend: ${action} ${amount} ETH`);

  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL.' });
  }

  try {
    const txResult = await executeTrade(action.toUpperCase(), amount);
    const price = await fetchPrice();

    res.json({
      status: 'success',
      action,
      txResult,
      price,
    });
  } catch (err) {
    logger.error('❌ Error in /signal:', err);
    res.status(500).json({ error: 'Signal failed', details: err.message });
  }
});

module.exports = router;
