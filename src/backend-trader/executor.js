// executor.js
// ✅ Final Stable Version — ETH <-> USDC Uniswap Swapper
// 🔐 Controlled by 61K Brain Only — No Manual Trades

import { JsonRpcProvider, Wallet } from 'ethers';
import { getAbi } from '../utils/getAbi.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const provider = new JsonRpcProvider('https://mainnet.base.org');
const wallet = new Wallet(PRIVATE_KEY, provider);

const UNISWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // Mainnet USDC
const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; // ETH placeholder

// == Contract Setup ==
const abi = getAbi('uniswap-router');
const routerContract = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, abi, wallet);

// == Swap Handler ==
export async function executeSwap(direction = 'ETH_TO_USDC', amountInEther = '0.01') {
  try {
    const amountInWei = ethers.utils.parseEther(amountInEther);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 mins

    let tx;

    if (direction === 'ETH_TO_USDC') {
      const params = {
        tokenIn: ETH_ADDRESS,
        tokenOut: USDC_ADDRESS,
        fee: 500,
        recipient: WALLET_ADDRESS,
        deadline,
        amountIn: amountInWei,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };

      tx = await routerContract.exactInputSingle(params, {
        value: amountInWei,
        gasLimit: 300000,
      });
    } else if (direction === 'USDC_TO_ETH') {
      const usdcContract = new ethers.Contract(USDC_ADDRESS, getAbi('erc20'), wallet);
      const allowance = await usdcContract.allowance(WALLET_ADDRESS, UNISWAP_ROUTER_ADDRESS);

      const amountToApprove = amountInWei;
      if (allowance.lt(amountToApprove)) {
        const approval = await usdcContract.approve(UNISWAP_ROUTER_ADDRESS, amountToApprove);
        await approval.wait();
      }

      const params = {
        tokenIn: USDC_ADDRESS,
        tokenOut: ETH_ADDRESS,
        fee: 500,
        recipient: WALLET_ADDRESS,
        deadline,
        amountIn: amountToApprove,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      };

      tx = await routerContract.exactInputSingle(params, {
        gasLimit: 300000,
      });
    }

    const receipt = await tx.wait();
    console.log(`[✅ EXECUTOR] Swap successful: ${receipt.transactionHash}`);
  } catch (err) {
    console.error('[❌ EXECUTOR ERROR]', err);
  }
}
