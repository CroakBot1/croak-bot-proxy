// executor.js

const { executeBuy, executeSell } = require('./uniswapHelpers');
const logger = require('./logger');

// Executes a BUY transaction using Uniswap (USDC -> ETH)
async function buyETH() {
  try {
    logger.info('💸 Initiating BUY execution...');
    const txHash = await executeBuy();
    logger.success(`✅ BUY executed successfully! Tx: ${txHash}`);
  } catch (error) {
    logger.error('❌ BUY execution failed:', error.message);
  }
}

// Executes a SELL transaction using Uniswap (ETH -> USDC)
async function sellETH() {
  try {
    logger.info('💸 Initiating SELL execution...');
    const txHash = await executeSell();
    logger.success(`✅ SELL executed successfully! Tx: ${txHash}`);
  } catch (error) {
    logger.error('❌ SELL execution failed:', error.message);
  }
}

module.exports = {
  buyETH,
  sellETH,
};
