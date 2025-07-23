// index.js (Entry Point)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

// New: Manual trigger endpoints
app.get('/buy', async (req, res) => {
  const result = await executeTrade('BUY', 0.001);
  res.json(result);
});

app.get('/sell', async (req, res) => {
  const result = await executeTrade('SELL', 0.001);
  res.json(result);
});

app.listen(PORT, () => {
  logger.info(`🚀 Server live on port ${PORT}`);
  startAutoLoop();
});
