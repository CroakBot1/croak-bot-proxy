// priceFetcher.js

const axios = require('axios');
const logger = require('./logger');
const BASE_URL = 'https://api.bybit.com/v5/market';

async function fetchPrice(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/tickers?category=linear&symbol=${symbol}`);
    const price = parseFloat(res.data.result.list[0].lastPrice);
    return price;
  } catch (err) {
    logger.error('❌ fetchPrice error:', err.message);
    return null;
  }
}

async function getFundingRate(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/funding/history?symbol=${symbol}`);
    return res.data.result.list[0]; // includes fundingRate, fundingRateTimestamp, etc.
  } catch (err) {
    logger.error('❌ getFundingRate error:', err.message);
    return { fundingRate: 0 };
  }
}

async function getLongShortRatio(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/account-ratio?symbol=${symbol}&period=5m`);
    return res.data.result.list[0]; // includes longShortRatio
  } catch (err) {
    logger.error('❌ getLongShortRatio error:', err.message);
    return { longShortRatio: 1 };
  }
}

async function getOpenInterest(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/open-interest?symbol=${symbol}&interval=5min`);
    return res.data.result.list[0];
  } catch (err) {
    logger.error('❌ getOpenInterest error:', err.message);
    return {};
  }
}

async function getVolumeStats(symbol = 'ETHUSDT') {
  try {
    const res = await axios.get(`${BASE_URL}/tickers?category=linear&symbol=${symbol}`);
    const { turnover24h, volume24h } = res.data.result.list[0];
    return { turnover24h, volume24h };
  } catch (err) {
    logger.error('❌ getVolumeStats error:', err.message);
    return {};
  }
}

module.exports = {
  fetchPrice,
  getFundingRate,
  getLongShortRatio,
  getOpenInterest,
  getVolumeStats
};
