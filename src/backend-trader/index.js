const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./logger');
const signalRoutes = require('./61k');
const { startAutoLoop } = require('./autoLoop');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/61k', signalRoutes);

app.get('/', (req, res) => {
  res.send('✅ Croak 24/7 Executor Running...');
});

app.listen(PORT, () => {
  logger.info(`🚀 Server live on port ${PORT}`);
  startAutoLoop();
});
