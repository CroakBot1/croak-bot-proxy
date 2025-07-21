// uniswapHelpers.js

const { ethers } = require('ethers');

// ✅ Correct Base token addresses
const USDC_ADDRESS = '0xd9AA094C8b3B869D95fC2eE6dA1dA4BCCeAaB7D0'; // USDC on Base
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // WETH on Base

// ✅ Uniswap V3 Router on Base
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Still valid on Base

const SLIPPAGE_TOLERANCE = 0.01;

function getDeadline() {
  return Math.floor(Date.now() / 1000) + 60;
}

function toRaw(amount, decimals = 18) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

function fromRaw(raw, decimals = 18) {
  return ethers.utils.formatUnits(raw, decimals);
}

module.exports = {
  USDC_ADDRESS,
  WETH_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  SLIPPAGE_TOLERANCE,
  getDeadline,
  toRaw,
  fromRaw,
};
