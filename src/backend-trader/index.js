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
app.use(cors());                // 🔓 Allow requests from frontend (fixes fetch error)
app.use(bodyParser.json());    // 📦 Enable JSON body parsing

// ✅ Mount signal routes at /signal endpoint
app.use('/signal', signalRoutes);  // 👈 KEEP THIS — don't move to root ('/')

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🟢 Croak Executor Backend is Alive');
});

// ✅ Start the server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});
