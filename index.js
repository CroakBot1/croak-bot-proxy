const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/price", async (req, res) => {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd");
    const data = await response.json();
    res.json({
      eth: data.ethereum.usd,
      btc: data.bitcoin.usd
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

app.get("/", (req, res) => {
  res.send("Croak Proxy Bot is alive 🐸");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
