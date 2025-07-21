// priceFetcher.js
const axios = require('axios');
const logger = require('./logger');

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const BASE_URL = 'https://api.dexscreener.com/latest/dex/pairs/ethereum';

async function getCurrentPrice() {
  try {
    const response = await axios.get(BASE_URL);
    const pairs = response.data.pairs;

    const tokenPair = pairs.find(pair =>
      pair.baseToken.address.toLowerCase() === TOKEN_ADDRESS.toLowerCase()
    );

    if (!tokenPair) {
      throw new Error('Token pair not found on DexScreener.');
    }

    const price = parseFloat(tokenPair.priceUsd);
    logger.info(`💲 Current price fetched: $${price}`);
    return price;

  } catch (err) {
    logger.error('❌ Failed to fetch price:', err.message);
    throw err;
  }
}

module.exports = {
  getCurrentPrice,
};
