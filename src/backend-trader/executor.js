require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');
const { getSwapTx, WETH_ADDRESS, USDC_ADDRESS } = require('./uniswapHelpers');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;
const INFURA_API = process.env.INFURA_API;

if (!PRIVATE_KEY || !WALLET || !INFURA_API) {
  logger.error('❌ Missing env vars (PRIVATE_KEY, WALLET, INFURA_API)');
  process.exit(1);
}

// ✅ Choose your RPC: Ethereum Mainnet or Base Mainnet
const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_API}`); // ← you can switch to Base RPC
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function executeTrade(action, amount) {
  try {
    const tokenIn = action === 'BUY' ? USDC_ADDRESS : WETH_ADDRESS;
    const tokenOut = action === 'BUY' ? WETH_ADDRESS : USDC_ADDRESS;
    const amountIn = amount;

    logger.info(`🚀 Preparing real ${action} trade for ${amountIn} ${tokenIn === USDC_ADDRESS ? 'USDC' : 'ETH'}`);

    const txData = await getSwapTx({
      wallet,
      amountIn,
      tokenIn,
      tokenOut,
    });

    logger.info(`📦 Sending transaction...`);
    const tx = await wallet.sendTransaction(txData);
    const receipt = await tx.wait();

    logger.info(`✅ Transaction confirmed: ${receipt.transactionHash}`);

    return {
      success: true,
      txHash: receipt.transactionHash,
      action,
      amount,
    };
  } catch (err) {
    logger.error('💥 Trade execution failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { executeTrade };
