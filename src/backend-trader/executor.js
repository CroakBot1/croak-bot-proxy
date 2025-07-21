// src/backend-trader/executor.js

require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');

const RPC_URL = process.env.BASE_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const UNISWAP_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4'; // Uniswap V3 on Base
const routerABI = require('./abi/uniswapRouter.json'); // ✅ Make sure this ABI exists
const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerABI, wallet);

// Base Tokens (update if needed)
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0xd9AA94D7eC644F6209BFb29b9763B1A39694ec23';

async function executeSwap({ tokenIn, tokenOut, amountIn, slippage = 0.5 }) {
  try {
    logger.info(`🔁 Preparing to swap ${amountIn} of ${tokenIn} → ${tokenOut}`);

    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), 18);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const amountsOut = await router.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
    const amountOutMin = amountsOut[1].mul(100 - slippage * 100).div(100);

    const tx = await router.swapExactTokensForTokens(
      amountInWei,
      amountOutMin,
      [tokenIn, tokenOut],
      WALLET_ADDRESS,
      deadline
    );

    logger.success(`🚀 Swap TX sent: ${tx.hash}`);
    await tx.wait();
    logger.success(`✅ Swap confirmed!`);
  } catch (err) {
    logger.error('❌ Swap failed:', err);
  }
}

// === Wrapper functions for trader.js ===
async function buyETH(amount = '0.01') {
  await executeSwap({
    tokenIn: USDC,
    tokenOut: WETH,
    amountIn: amount
  });
}

async function sellETH(amount = '0.01') {
  await executeSwap({
    tokenIn: WETH,
    tokenOut: USDC,
    amountIn: amount
  });
}

module.exports = {
  executeSwap,
  buyETH,
  sellETH
};
