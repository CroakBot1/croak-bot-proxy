// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./logger');
const signalRoutes = require('./61k');
const { startAutoLoop } = require('./autoLoop');
const { executeTrade } = require('./executor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/61k', signalRoutes);

app.get('/', (req, res) => {
  res.send('✅ Croak 24/7 Executor Running...');
});

// 🔁 Manual triggers via GET
app.get('/buy', async (req, res) => {
  try {
    const result = await executeTrade('BUY', 0.001);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/sell', async (req, res) => {
  try {
    const result = await executeTrade('SELL', 0.001);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Server live on port ${PORT}`);
  startAutoLoop();
});
