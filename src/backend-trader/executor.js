require('dotenv').config();
const { ethers } = require('ethers');
const { getSwapTx } = require('./uniswapHelpers');
const logger = require('./logger');

const provider = new ethers.JsonRpcProvider(process.env.RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function executeTrade(action, amount) {
  try {
    logger.info(`🚀 Executing ${action} | ${amount} ETH`);

    const tokenIn = action === 'BUY' ? process.env.USDC : process.env.WETH;
    const tokenOut = action === 'BUY' ? process.env.WETH : process.env.USDC;

    const txData = await getSwapTx({
      wallet,
      amountIn: amount,
      tokenIn,
      tokenOut,
    });

    const tx = await wallet.sendTransaction(txData);
    logger.info(`📤 Sent tx: ${tx.hash}`);
    await tx.wait();

    return { success: true, hash: tx.hash };
  } catch (err) {
    logger.error('💥 Trade failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { executeTrade };
