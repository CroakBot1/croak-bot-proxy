// src/backend-trader/executor.js

require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');
const erc20ABI = require('./abi/erc20.json');
const routerABI = require('./abi/uniswapRouter.json'); // ✅ Make sure this exists

// === Config ===
const RPC_URL = process.env.BASE_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const UNISWAP_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4'; // Uniswap V3 on Base

// === Tokens (update if needed) ===
const WETH = '0x4200000000000000000000000000000000000006';
const USDC = '0xd9AA94D7eC644F6209BFb29b9763B1A39694ec23';

// === Setup ===
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerABI, wallet);

// === Approve token if needed ===
async function approveTokenIfNeeded(token, amount, spender) {
  const contract = new ethers.Contract(token, erc20ABI, wallet);
  const allowance = await contract.allowance(WALLET_ADDRESS, spender);
  if (allowance.lt(amount)) {
    logger.info(`🔓 Approving ${ethers.utils.formatUnits(amount)} of token ${token} to router...`);
    const tx = await contract.approve(spender, ethers.constants.MaxUint256);
    await tx.wait();
    logger.success(`✅ Approved ${token}`);
  }
}

// === Execute Swap ===
async function executeSwap({ tokenIn, tokenOut, amountIn, slippage = 0.5 }) {
  try {
    logger.info(`🔁 Preparing swap: ${amountIn} ${tokenIn} → ${tokenOut}`);

    // Get decimals of input token
    const inputTokenContract = new ethers.Contract(tokenIn, erc20ABI, wallet);
    const decimals = await inputTokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), decimals);

    // Approve if needed
    await approveTokenIfNeeded(tokenIn, amountInWei, UNISWAP_ROUTER_ADDRESS);

    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes

    // Get minimum amountOut after slippage
    const amountsOut = await router.getAmountsOut(amountInWei, [tokenIn, tokenOut]);
    const amountOutMin = amountsOut[1].mul(100 - slippage * 100).div(100);

    const tx = await router.swapExactTokensForTokens(
      amountInWei,
      amountOutMin,
      [tokenIn, tokenOut],
      WALLET_ADDRESS,
      deadline
    );

    logger.success(`🚀 TX sent: ${tx.hash}`);
    await tx.wait();
    logger.success(`✅ Swap confirmed!`);
  } catch (err) {
    logger.error(`❌ Swap failed: ${err.message || err}`);
  }
}

// === Buy/Sell Wrappers ===
async function buyETH(amount = '0.01') {
  return await executeSwap({
    tokenIn: USDC,
    tokenOut: WETH,
    amountIn: amount
  });
}

async function sellETH(amount = '0.01') {
  return await executeSwap({
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
