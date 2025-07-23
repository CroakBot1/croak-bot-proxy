require('dotenv').config();
const { ethers } = require('ethers');
const logger = require('./logger');
const { getSwapTx, WETH_ADDRESS, USDC_ADDRESS } = require('./uniswapHelpers');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider('https://mainnet.base.org'); // ✅ BASE MAINNET
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function executeTrade(action, amountInEth) {
  try {
    logger.info(`🚀 Executing ${action} for ${amountInEth} ETH on BASE`);

    const isBuy = action.toUpperCase() === 'BUY';
    const tokenIn = isBuy ? WETH_ADDRESS : USDC_ADDRESS;
    const tokenOut = isBuy ? USDC_ADDRESS : WETH_ADDRESS;

    const txRequest = await getSwapTx({
      wallet,
      amountIn: amountInEth,
      tokenIn,
      tokenOut
    });

    logger.info('🧠 Built TX:', txRequest);

    const txResponse = await wallet.sendTransaction(txRequest);
    logger.info('📤 TX sent! Hash:', txResponse.hash);

    const receipt = await txResponse.wait();
    logger.info('✅ TX confirmed:', receipt.transactionHash);

    return {
      success: true,
      hash: receipt.transactionHash,
      action,
      amount: amountInEth
    };

  } catch (err) {
    logger.error('💥 Trade failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { executeTrade };
