// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { handleSignal } = require('./signal');
const logger = require('./logger');

const app = express();
app.use(bodyParser.json());

app.post('/signal', handleSignal);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`🚀 Backend ready on port ${PORT}`);
});
