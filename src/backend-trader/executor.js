// == EXECUTOR.JS ==
// Uniswap V3 Token Swap Executor (ETH ⇄ USDC)

require('dotenv').config();
const { ethers } = require("ethers");
const { Token } = require('@uniswap/sdk-core');
const { abi: SWAP_ROUTER_ABI } = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');

const logger = require('./logger');
const { getCurrentPrice } = require('./priceFetcher');

// ENV CONFIG
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;
const BASE_RPC = process.env.BASE_RPC;

const provider = new ethers.JsonRpcProvider(BASE_RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Constants
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 Router
const USDC_ADDRESS = '0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606eb48';
const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2';
const POOL_FEE = 3000;

const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, SWAP_ROUTER_ABI, wallet);

// == Swap ETH → USDC ==
async function swapEthToUsdc(amountInETH) {
  try {
    logger.info("🔁 ETH → USDC swap:", amountInETH, "ETH");
    const ethAmount = ethers.parseEther(amountInETH.toString());

    const params = {
      tokenIn: ETH_ADDRESS,
      tokenOut: USDC_ADDRESS,
      fee: POOL_FEE,
      recipient: WALLET,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: ethAmount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const tx = await swapRouter.exactInputSingle(params, {
      value: ethAmount,
      gasLimit: 1_000_000
    });

    logger.info("✅ TX sent:", tx.hash);
    const receipt = await tx.wait();
    logger.info("🎉 ETH → USDC Swap complete. Block:", receipt.blockNumber);
  } catch (err) {
    logger.error("💥 ETH → USDC Swap failed:", err);
  }
}

// == Swap USDC → ETH ==
async function swapUsdcToEth(amountInUSDC) {
  try {
    logger.info("🔁 USDC → ETH swap:", amountInUSDC, "USDC");
    const usdcAmount = ethers.parseUnits(amountInUSDC.toString(), 6); // USDC has 6 decimals

    // Approve router to spend USDC
    const usdc = new ethers.Contract(
      USDC_ADDRESS,
      ['function approve(address spender, uint256 amount) public returns (bool)'],
      wallet
    );
    const approvalTx = await usdc.approve(SWAP_ROUTER_ADDRESS, usdcAmount);
    await approvalTx.wait();
    logger.info("🔐 Approved USDC to router");

    const params = {
      tokenIn: USDC_ADDRESS,
      tokenOut: ETH_ADDRESS,
      fee: POOL_FEE,
      recipient: WALLET,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: usdcAmount,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    };

    const tx = await swapRouter.exactInputSingle(params, {
      gasLimit: 1_000_000
    });

    logger.info("✅ TX sent:", tx.hash);
    const receipt = await tx.wait();
    logger.info("🎉 USDC → ETH Swap complete. Block:", receipt.blockNumber);
  } catch (err) {
    logger.error("💥 USDC → ETH Swap failed:", err);
  }
}

module.exports = {
  swapEthToUsdc,
  swapUsdcToEth
};
