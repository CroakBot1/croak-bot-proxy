// signal.js

const logger = require('./logger');
const { fetchMarketSnapshot } = require('./priceFetcher');
const brain = require('./brain');
const { executeSwap } = require('./executor');
const { USDC_ADDRESS, WETH_ADDRESS } = require('./uniswapHelpers');

// Auto-signal runner
async function runSignalCheck() {
  try {
    const snapshot = await fetchMarketSnapshot();
    logger.info('📦 Market Snapshot:', snapshot);

    const shouldBuy = brain.shouldBuy(snapshot);
    const shouldSell = brain.shouldSell(snapshot);

    if (shouldBuy) {
      logger.info('🚀 Signal says BUY. Preparing swap...');
      await executeBuy(snapshot);
      return 'buy';
    }

    if (shouldSell) {
      logger.info('🔻 Signal says SELL. Preparing swap...');
      await executeSell(snapshot);
      return 'sell';
    }

    logger.info('🛑 No trade signal at this price.');
    return 'hold';
  } catch (err) {
    logger.error('💥 Signal Check Error:', err.message || err);
    return 'error';
  }
}

// Buy ETH with USDC
async function executeBuy(snapshot) {
  const amountIn = "5"; // USDC (adjust based on your logic or config)

  await executeSwap({
    amountIn,
    tokenIn: USDC_ADDRESS,
    tokenOut: WETH_ADDRESS,
    slippage: 0.01,
  });

  brain.adjustBrainMemory('win'); // or adjust based on outcome
}

// Sell ETH for USDC
async function executeSell(snapshot) {
  const amountIn = "0.002"; // ETH (adjust based on your logic or config)

  await executeSwap({
    amountIn,
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    slippage: 0.01,
  });

  brain.adjustBrainMemory('win'); // or adjust based on outcome
}

module.exports = {
  runSignalCheck,
};
