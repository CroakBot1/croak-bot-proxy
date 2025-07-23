// executor.js

const { ethers } = require('ethers');
const {
  getSwapTx,
  WETH_ADDRESS,
  USDC_ADDRESS
} = require('./uniswapHelpers');
const logger = require('./logger');

// 🔐 PRIVATE
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org'); // Replace with real Base RPC
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// === BUY FUNCTION (USDC → WETH) ===
async function executeBuy(amountInUSDC) {
  try {
    logger.info(`🔁 Preparing BUY tx | Amount: ${amountInUSDC} USDC`);

    const txConfig = await getSwapTx({
      wallet,
      amountIn: amountInUSDC,
      tokenIn: USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      slippage: 0.01
    });

    const tx = await wallet.sendTransaction(txConfig);
    logger.info(`🟢 BUY tx sent: ${tx.hash}`);
    await tx.wait();
    logger.info(`✅ BUY tx confirmed`);
  } catch (err) {
    logger.error('❌ BUY FAILED:', err.message || err);
  }
}

// === SELL FUNCTION (WETH → USDC) ===
async function executeSell(amountInWETH) {
  try {
    logger.info(`🔁 Preparing SELL tx | Amount: ${amountInWETH} WETH`);

    const txConfig = await getSwapTx({
      wallet,
      amountIn: amountInWETH,
      tokenIn: WETH_ADDRESS,
      tokenOut: USDC_ADDRESS,
      slippage: 0.01
    });

    const tx = await wallet.sendTransaction(txConfig);
    logger.info(`🔻 SELL tx sent: ${tx.hash}`);
    await tx.wait();
    logger.info(`✅ SELL tx confirmed`);
  } catch (err) {
    logger.error('❌ SELL FAILED:', err.message || err);
  }
}

// === SAMPLE CALL (REMOVE in production) ===
// (Uncomment to test directly)
// executeBuy(20); // Buy WETH using 20 USDC
// executeSell(0.01); // Sell 0.01 WETH for USDC

module.exports = {
  executeBuy,
  executeSell
};
