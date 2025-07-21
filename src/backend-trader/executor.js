// executor.js
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

// ENV
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;

// RPC + Uniswap BASE Router
const RPC_URL = 'https://mainnet.base.org'; // BASE MAINNET
const ROUTER_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86'; // Uniswap V2 BASE Router
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // ETH on BASE
const USDC_ADDRESS = '0xd9AA094d0D7bD0Af9e3C0c5a5821EbE777AfaeD7'; // USDC on BASE

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const routerAbi = [
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];
const erc20Abi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint)',
  'function balanceOf(address account) external view returns (uint)'
];

const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);
const usdc = new ethers.Contract(USDC_ADDRESS, erc20Abi, wallet);

// === BUY USDC WITH ETH ===
async function buyUSDCWithETH(ethAmountIn) {
  const ethAmount = ethers.utils.parseEther(ethAmountIn.toString());
  const path = [WETH_ADDRESS, USDC_ADDRESS];
  const amountsOut = await router.getAmountsOut(ethAmount, path);
  const amountOutMin = amountsOut[1].mul(98).div(100); // 2% slippage

  const tx = await router.swapExactETHForTokens(
    amountOutMin,
    path,
    WALLET_ADDRESS,
    Math.floor(Date.now() / 1000) + 60,
    { value: ethAmount }
  );

  console.log(`[✅ BUY] Tx Hash: ${tx.hash}`);
  await tx.wait();
  console.log(`[✅ BUY] Confirmed.`);
}

// === SELL USDC FOR ETH ===
async function sellUSDCForETH(usdcAmountIn) {
  const usdcAmount = ethers.utils.parseUnits(usdcAmountIn.toString(), 6);
  const allowance = await usdc.allowance(WALLET_ADDRESS, ROUTER_ADDRESS);
  if (allowance.lt(usdcAmount)) {
    const approveTx = await usdc.approve(ROUTER_ADDRESS, ethers.constants.MaxUint256);
    console.log(`[⚙️ APPROVE] Tx Hash: ${approveTx.hash}`);
    await approveTx.wait();
    console.log(`[⚙️ APPROVE] Confirmed.`);
  }

  const path = [USDC_ADDRESS, WETH_ADDRESS];
  const amountsOut = await router.getAmountsOut(usdcAmount, path);
  const amountOutMin = amountsOut[1].mul(98).div(100); // 2% slippage

  const tx = await router.swapExactTokensForETH(
    usdcAmount,
    amountOutMin,
    path,
    WALLET_ADDRESS,
    Math.floor(Date.now() / 1000) + 60
  );

  console.log(`[✅ SELL] Tx Hash: ${tx.hash}`);
  await tx.wait();
  console.log(`[✅ SELL] Confirmed.`);
}

// === EXAMPLE RUN ===
async function main() {
  // await buyUSDCWithETH(0.001);  // Example: Buy $USDC with 0.001 ETH
  // await sellUSDCForETH(2);      // Example: Sell 2 USDC to get ETH
}

main();
