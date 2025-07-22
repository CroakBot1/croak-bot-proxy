// == executor.js ==
// 💸 Handles Uniswap buy/sell execution

require('dotenv').config();
const { ethers } = require('ethers');
const { getSwapTx } = require('./uniswapHelpers');
const logger = require('./logger');

// 🔒 Environment Variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;
const RPC_URL = process.env.RPC_URL;

// 🔗 Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 🔄 Swap Executor
async function executeSwap({ amountIn, tokenIn, tokenOut, slippage = 0.01 }) {
  try {
    logger.info('🔐 Connected to wallet:', WALLET);
    logger.info('🧠 EXEC SWAP | Wallet:', WALLET);
    logger.info('🧪 Params', tokenIn, '➡️', tokenOut, '| Amount:', amountIn, '| Slippage:', slippage);

    const tx = await getSwapTx({
      wallet,
      amountIn,
      tokenIn,
      tokenOut,
      slippage,
    });

    const sent = await wallet.sendTransaction(tx);
    logger.info('📤 TX Sent:', sent.hash);
    const receipt = await sent.wait();
    logger.info('✅ TX Confirmed:', receipt.transactionHash);
    return receipt;
  } catch (err) {
    logger.error('💥 Swap Error:', err.message || err);
    return null;
  }
}

module.exports = { executeSwap };

// ✅ Test Trigger Block (only runs if file is run directly)
const { USDC_ADDRESS, WETH_ADDRESS } = require('./uniswapHelpers');

if (require.main === module) {
  executeSwap({
    amountIn: "0.0005", // ETH
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    slippage: 0.01,
  });
}
