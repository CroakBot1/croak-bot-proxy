const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const logger = require('./logger');
const signalRoutes = require('./signal');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ MOUNT CORRECTLY AT /signal
app.use('/signal', signalRoutes);

app.get('/', (req, res) => {
  res.send('🟢 Croak Executor Backend is Alive');
});

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
