// src/backend-trader/executor.js

require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 🦄 Uniswap Router (V2-style, change if using V3)
const UNISWAP_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; // Mainnet
const routerABI = require('./abi/uniswapRouter.json'); // You must add this ABI file
const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerABI, wallet);

// === MAIN TRADE FUNCTION ===
async function executeSwap({ tokenIn, tokenOut, amountIn, slippage = 0.5 }) {
  try {
    logger.info(`🔁 Preparing to swap ${amountIn} of ${tokenIn} → ${tokenOut}`);

    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes from now

    const amountsOut = await router.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
    const amountOutMin = amountsOut[1].mul(100 - slippage * 100).div(100); // Slippage protection

    const tx = await router.swapExactTokensForTokens(
      amountInWei,
      amountOutMin,
      [tokenIn, tokenOut],
      WALLET_ADDRESS,
      deadline
    );

    logger.info(`🚀 Swap TX sent: ${tx.hash}`);
    await tx.wait();
    logger.info(`✅ Swap confirmed!`);
  } catch (err) {
    logger.error('❌ Swap failed:', err);
  }
}

module.exports = {
  executeSwap
};
