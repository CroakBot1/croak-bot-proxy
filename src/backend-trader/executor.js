// executor.js
const { ethers } = require('ethers');
const { abi: routerAbi } = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
require('dotenv').config();

const RPC_URL = 'https://mainnet.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ROUTER_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86'; // Uniswap v2 Router on Base
const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);

const TOKEN = {
  ETH: '0x4200000000000000000000000000000000000006',
  USDC: '0xd9aa0000000000000000000000000000000000dc',
};

async function swap(tokenIn, tokenOut, amountIn) {
  try {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
    const amountInWei = ethers.parseUnits(amountIn.toString(), tokenIn === TOKEN.USDC ? 6 : 18);
    const path = [tokenIn, tokenOut];

    if (tokenIn === TOKEN.USDC) {
      const usdcContract = new ethers.Contract(tokenIn, ['function approve(address,uint256) public returns (bool)'], wallet);
      const tx = await usdcContract.approve(ROUTER_ADDRESS, amountInWei);
      await tx.wait();
    }

    const tx = await router.swapExactTokensForTokens(
      amountInWei,
      0, // Accept any amountOut
      path,
      WALLET_ADDRESS,
      deadline
    );

    console.log('[✅ SWAPPED]', tokenIn, '->', tokenOut, 'TX:', tx.hash);
  } catch (err) {
    console.error('[❌ SWAP ERROR]', err.message);
  }
}

module.exports = {
  swap,
  TOKEN,
};
