// uniswapHelpers.js

const { ethers } = require('ethers');

// ✅ Replace these with correct token addresses on BASE or Ethereum Mainnet
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC (Ethereum Mainnet)
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH (Ethereum Mainnet)

// ✅ Uniswap V3 Router address (Mainnet)
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Default slippage: 1% = 0.01
const SLIPPAGE_TOLERANCE = 0.01;

/**
 * Returns UNIX timestamp + 60 seconds
 */
function getDeadline() {
  return Math.floor(Date.now() / 1000) + 60;
}

/**
 * Converts number to raw token format
 * @param {number} amount 
 * @param {number} decimals 
 * @returns {ethers.BigNumber}
 */
function toRaw(amount, decimals = 18) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

/**
 * Converts raw token value to human-readable format
 * @param {ethers.BigNumber} raw 
 * @param {number} decimals 
 * @returns {string}
 */
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
  fromRaw
};
