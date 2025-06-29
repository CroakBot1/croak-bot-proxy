const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🟢 Croak Bot Proxy is Alive!');
});

// Optional: Add your proxy/api logic here

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
