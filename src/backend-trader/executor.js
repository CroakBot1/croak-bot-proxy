// executor.js – FIXED for Ethers v6+

import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const BASE_RPC = process.env.BASE_RPC || 'https://mainnet.base.org';
const ABI = JSON.parse(fs.readFileSync('./src/backend-trader/abi.json', 'utf8'));

const provider = new JsonRpcProvider(BASE_RPC);
const wallet = new Wallet(PRIVATE_KEY, provider);

const routerAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; // Replace with actual router
const tokenIn = '0x...'; // Replace with actual token in
const tokenOut = '0x...'; // Replace with actual token out

const routerContract = new Contract(routerAddress, ABI, wallet);

async function executeTrade() {
  try {
    const amountIn = BigInt(1e18); // 1 ETH (example)
    const amountOutMin = BigInt(0); // You should calculate slippage

    const tx = await routerContract.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      [tokenIn, tokenOut],
      WALLET_ADDRESS,
      BigInt(Math.floor(Date.now() / 1000) + 60 * 10) // deadline
    );

    console.log('Swap Tx Hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction Confirmed:', receipt.transactionHash);
  } catch (err) {
    console.error('[❌ EXECUTION ERROR]', err.message);
  }
}

executeTrade();
