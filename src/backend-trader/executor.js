// src/backend-trader/executor.js
const { ethers } = require('ethers');
require('dotenv').config();

const UNISWAP_ROUTER_ADDRESS = '0x5615CDAb10dc425a742d643d949a7F474C01abc4'; // BASE Uniswap V3 Router
const WETH = '0x4200000000000000000000000000000000000006'; // WETH on BASE
const USDC = '0xd9AA94D7eC644F6209BFb29b9763B1A39694ec23'; // USDC on BASE

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const routerAbi = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)"
];

const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, routerAbi, wallet);

async function executeBuy(amountInEth) {
  const amountInWei = ethers.parseEther(amountInEth.toString());

  const params = {
    tokenIn: WETH,
    tokenOut: USDC,
    fee: 3000,
    recipient: process.env.WALLET,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn: amountInWei,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n,
  };

  try {
    const tx = await router.exactInputSingle(params, {
      value: amountInWei,
      gasLimit: 500000,
    });
    console.log('✅ BUY TX Sent:', tx.hash);
    await tx.wait();
    console.log('🎉 BUY TX Confirmed');
  } catch (err) {
    console.error('❌ BUY Error:', err.message);
  }
}

async function executeSell(amountInUSDC) {
  const amountIn = ethers.parseUnits(amountInUSDC.toString(), 6); // USDC = 6 decimals

  const usdc = new ethers.Contract(USDC, [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ], wallet);

  try {
    const approveTx = await usdc.approve(UNISWAP_ROUTER_ADDRESS, amountIn);
    await approveTx.wait();
    console.log('✅ Approved USDC');

    const params = {
      tokenIn: USDC,
      tokenOut: WETH,
      fee: 3000,
      recipient: process.env.WALLET,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn,
      amountOutMinimum: 0n,
      sqrtPriceLimitX96: 0n,
    };

    const tx = await router.exactInputSingle(params, {
      gasLimit: 500000,
    });
    console.log('✅ SELL TX Sent:', tx.hash);
    await tx.wait();
    console.log('🎉 SELL TX Confirmed');
  } catch (err) {
    console.error('❌ SELL Error:', err.message);
  }
}

module.exports = {
  executeBuy,
  executeSell,
};
