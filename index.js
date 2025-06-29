const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Croak Proxy Bot is live!");
});

app.get("/price", async (req, res) => {
  try {
    const ethData = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const btcData = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");

    res.json({
      eth: ethData.data.ethereum.usd,
      btc: btcData.data.bitcoin.usd,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch price data." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
