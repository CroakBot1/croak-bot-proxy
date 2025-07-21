const express = require('express');
const { checkPriceAndTrade } = require('./trader');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🐸 Croak Bot Live');
});

setInterval(async () => {
  await checkPriceAndTrade();
}, 10 * 1000); // every 10s

app.listen(PORT, () => {
  logger.info(`🚀 CROAK BOT listening on port ${PORT}`);
});

