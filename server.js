// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('🟢 Croak Bot Proxy is Alive!');
});

// Optional route to manually test cronjob trigger
app.get('/ping', (req, res) => {
  console.log('📡 Ping received at', new Date().toISOString());
  res.send('🔁 Ping received – Croak bot is online.');
});

app.listen(PORT, () => {
  console.log(`🚀 Croak Ping Server running on port ${PORT}`);
});
