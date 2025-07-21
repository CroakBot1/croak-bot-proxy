// executor.js
const { Wallet, ethers } = require('ethers');
const {
  SWAP_ROUTER_ADDRESS,
  WALLET_ADDRESS,
  PRIVATE_KEY,
  USDC_ADDRESS,
  ETH_ADDRESS
} = require('./config');
const { getProvider } = require('./provider');
const logger = require('./logger');
const { swapExactETHForTokens, swapExactTokensForETH } = require('./uniswapHelpers');

const provider = getProvider();
const wallet = new Wallet(PRIVATE_KEY, provider);

async function buyETH() {
  try {
    logger.info('💸 Executing BUY on Uniswap (USDC → ETH)...');
    const tx = await swapExactTokensForETH({
      wallet,
      amountInUSDC: '20', // Change as needed
    });
    logger.success(`✅ BUY SUCCESS: ${tx.hash}`);
  } catch (err) {
    logger.error('❌ BUY failed:', err.message);
  }
}

async function sellETH() {
  try {
    logger.info('💰 Executing SELL on Uniswap (ETH → USDC)...');
    const tx = await swapExactETHForTokens({
      wallet,
      amountInETH: '0.01', // Change as needed
    });
    logger.success(`✅ SELL SUCCESS: ${tx.hash}`);
  } catch (err) {
    logger.error('❌ SELL failed:', err.message);
  }
}

module.exports = {
  buyETH,
  sellETH,
};
