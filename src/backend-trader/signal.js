const express = require('express');
const router = express.Router();
const { executeTrade } = require('./executor');
const { fetchMarketSnapshot } = require('./priceFetcher');
const logger = require('./logger');

// Signal handler from frontend
router.post('/signal', async (req, res) => {
  const { action, amount } = req.body;

  logger.info(`📡 Received signal from frontend: ${action} ${amount} ETH`);

  if (!action || !['BUY', 'SELL'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action. Must be BUY or SELL.' });
  }

  try {
    // 🔁 Execute Uniswap trade
    const txResult = await executeTrade(action.toUpperCase(), amount);

    // 📈 Fetch latest market data from Bybit
    const marketData = await fetchMarketSnapshot();

    // 🧠 Respond to frontend
    res.json({
      status: 'success',
      action,
      txResult,
      marketData
    });
  } catch (err) {
    logger.error('❌ Error in /signal:', err);
    res.status(500).json({ error: 'Signal processing failed', details: err.message });
  }
});

module.exports = router;
