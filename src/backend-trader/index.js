const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const logger = require('./logger');
const signalRoutes = require('./signal');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(cors()); // Allow frontend to access this backend
app.use(bodyParser.json());

// ✅ Mount /signal route
app.use('/', signalRoutes); // now /signal is correctly accessible

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('🟢 Croak Executor Backend is Alive');
});

// ✅ Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
