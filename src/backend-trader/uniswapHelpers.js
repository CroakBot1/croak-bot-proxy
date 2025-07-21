// uniswapHelpers.js
const { ethers } = require('ethers');
const { TradeType, CurrencyAmount, Percent } = require('@uniswap/sdk-core');
const {
  Pool,
  Route,
  Trade,
  SwapRouter,
  SwapOptions,
} = require('@uniswap/v3-sdk');
const JSBI = require('jsbi');

// Constants
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;
const SLIPPAGE_TOLERANCE = new Percent(50, 10_000); // 0.50%
const DEADLINE_BUFFER = 60 * 5; // 5 minutes

// Contract Addresses (Base mainnet or Ethereum mainnet)
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Ethereum Mainnet USDC
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 Router

function toReadable(amount, decimals = 18) {
  return ethers.utils.formatUnits(amount.toString(), decimals);
}

function toRaw(amount, decimals = 18) {
  return ethers.utils.parseUnits(amount.toString(), decimals);
}

function getDeadline() {
  return Math.floor(Date.now() / 1000) + DEADLINE_BUFFER;
}

async function buildTrade({
  pool,
  inputAmountRaw,
  tokenIn,
  tokenOut,
  tradeType = TradeType.EXACT_INPUT,
}) {
  const inputAmount = CurrencyAmount.fromRawAmount(tokenIn, JSBI.BigInt(inputAmountRaw));
  const route = new Route([pool], tokenIn, tokenOut);
  const trade = Trade.createUncheckedTrade({
    route,
    inputAmount,
    outputAmount: CurrencyAmount.fromRawAmount(
      tokenOut,
      JSBI.BigInt(pool.getOutputAmount(inputAmount)[0].quotient)
    ),
    tradeType,
  });
  return trade;
}

module.exports = {
  USDC_ADDRESS,
  WETH_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  SLIPPAGE_TOLERANCE,
  getDeadline,
  toReadable,
  toRaw,
  buildTrade,
};
