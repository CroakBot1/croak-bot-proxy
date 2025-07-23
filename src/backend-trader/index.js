// 📦 Loads environment variables
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const signalHandler = require('./signal');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// 🌐 Root endpoint for basic status check
app.get('/', (req, res) => {
  res.send('🟢 Croak Bot Backend Trader is live!');
});

// 📡 POST endpoint for BUY/SELL signal
app.post('/signal', signalHandler);

// 🟢 Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend Trader running on http://localhost:${PORT}`);
});
