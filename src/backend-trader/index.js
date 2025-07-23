require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const { startAutoLoop } = require('./brain');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Croak Uniswap Bot Running 24/7...');
});

app.listen(PORT, () => {
  logger.info(`🌐 Server running on port ${PORT}`);
  startAutoLoop(); // Start auto strategy
});
