// == executor.js ==
// 💸 Handles Uniswap buy/sell execution

require('dotenv').config();
const { ethers } = require('ethers');
const { getSwapTx, USDC_ADDRESS, WETH_ADDRESS } = require('./uniswapHelpers');
const logger = require('./logger');

// 🔒 Load Environment Variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;
const RPC_URL = process.env.RPC_URL;

// 🔗 Set up provider and signer
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 🔄 Main Swap Executor Function
async function executeSwap({ amountIn, tokenIn, tokenOut, slippage = 0.01 }) {
  try {
    logger.info('🔐 Connected to wallet:', WALLET);
    logger.info('🧠 EXEC SWAP | Params:', tokenIn, '➡️', tokenOut, '| Amount:', amountIn, '| Slippage:', slippage);

    // ⚙️ Build transaction
    const tx = await getSwapTx({
      wallet,
      amountIn,
      tokenIn,
      tokenOut,
      slippage,
    });

    // 🚀 Send transaction
    const sentTx = await wallet.sendTransaction(tx);
    logger.info('📤 TX Sent:', sentTx.hash);

    // ⏳ Wait for confirmation
    const receipt = await sentTx.wait();
    logger.info('✅ TX Confirmed:', receipt.transactionHash);

    return receipt;
  } catch (err) {
    logger.error('💥 Swap Error:', err?.reason || err?.message || err);
    return null;
  }
}

module.exports = { executeSwap };

// ✅ Standalone Test Block (runs only if executor.js is executed directly)
if (require.main === module) {
  (async () => {
    logger.info('🧪 Running standalone swap test...');
    await executeSwap({
      amountIn: "0.0005", // ETH
      tokenIn: WETH_ADDRESS,
      tokenOut: USDC_ADDRESS,
      slippage: 0.01,
    });
  })();
}
