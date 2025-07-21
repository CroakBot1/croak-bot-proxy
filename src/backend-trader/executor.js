// executor.js
const { ethers } = require('ethers');

// 🔐 ENV setup
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;

// 🛠️ Provider (Base Mainnet)
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

// 🧠 Wallet instance
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ✅ Example buy function on Uniswap v2-style router
const ROUTER_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86'; // Example: BaseSwap
const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory)'
];

const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);

// 🐸 BUY function
async function buyToken(tokenAddress, ethAmountIn) {
  try {
    const path = ['0x4200000000000000000000000000000000000006', tokenAddress]; // WETH -> token
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 min

    const tx = await router.swapExactETHForTokens(
      0, // amountOutMin: slippage protection can be added
      path,
      WALLET,
      deadline,
      {
        value: ethers.utils.parseEther(ethAmountIn),
        gasLimit: 300000
      }
    );

    console.log('[✅ TX SENT]', tx.hash);
    const receipt = await tx.wait();
    console.log('[🎉 TX CONFIRMED]', receipt.transactionHash);
  } catch (err) {
    console.error('[❌ TX ERROR]', err);
  }
}

// Example call
// buyToken('0xYourTokenHere', '0.01');

module.exports = {
  buyToken
};
