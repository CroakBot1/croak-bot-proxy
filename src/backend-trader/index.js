require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./logger');
const { startAutoLoop } = require('./brain');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('✅ Croak Executor is running 24/7...');
});

app.listen(PORT, () => {
  logger.info(`🚀 Executor running on port ${PORT}`);
  startAutoLoop();
});
