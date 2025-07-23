const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const signalRoutes = require('./signal');
const logger = require('./logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Mount correctly
app.use('/signal', signalRoutes);

app.get('/', (req, res) => {
  res.send('🟢 Croak Executor Backend is Alive');
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
