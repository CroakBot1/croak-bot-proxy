// src/backend-trader/executor.js
const { ethers } = require('ethers');
const logger = require('./logger');
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;

// 🟢 Base Network RPC & Uniswap V2 Router
const BASE_RPC = 'https://mainnet.base.org';
const provider = new ethers.JsonRpcProvider(BASE_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Uniswap V2 Router on Base
const UNISWAP_ROUTER_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
const UNISWAP_ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)'
];

// 🟡 Token Addresses (WETH on Base)
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0xA0b86991c6218b36c1d19d4a2e9eb0cE3606eB48'; // Example stablecoin, replace if needed

const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);

async function buyETH() {
  try {
    const ethAmount = ethers.parseEther('0.001'); // Change trade size here
    const path = [WETH, USDC];
    const deadline = Math.floor(Date.now() / 1000) + 60;

    const tx = await router.swapExactETHForTokens(
      0, // amountOutMin
      path,
      WALLET,
      deadline,
      { value: ethAmount, gasLimit: 800000 }
    );

    logger.success(`✅ BUY TX SENT: ${tx.hash}`);
    await tx.wait();
    logger.success('✅ BUY TX CONFIRMED!');
  } catch (err) {
    logger.error('❌ BUY FAILED:', err.reason || err.message);
  }
}

async function sellETH() {
  try {
    const tokenAmount = ethers.parseUnits('0.001', 18); // Amount of WETH to sell
    const path = [USDC, WETH];
    const deadline = Math.floor(Date.now() / 1000) + 60;

    const tx = await router.swapExactTokensForETH(
      tokenAmount,
      0, // amountOutMin
      path,
      WALLET,
      deadline,
      { gasLimit: 800000 }
    );

    logger.success(`✅ SELL TX SENT: ${tx.hash}`);
    await tx.wait();
    logger.success('✅ SELL TX CONFIRMED!');
  } catch (err) {
    logger.error('❌ SELL FAILED:', err.reason || err.message);
  }
}

module.exports = {
  buyETH,
  sellETH,
};
