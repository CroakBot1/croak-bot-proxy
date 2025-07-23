const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const signalRoutes = require('./signal');
const logger = require('./logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/signal', signalRoutes);

app.get('/', (req, res) => {
  res.send('🟢 Croak Executor Backend is Alive');
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
