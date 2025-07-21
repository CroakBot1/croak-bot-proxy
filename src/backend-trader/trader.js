// trader.js
require('dotenv').config();
const { WETH_ADDRESS, USDC_ADDRESS } = require('./uniswapHelpers');
const { executeSwap } = require('./executor');

const WALLET = process.env.WALLET;

// Simple strategy trigger
async function tradeETHtoUSDC(amountInEth) {
  console.log(`🚀 Initiating ETH ➡️ USDC swap: ${amountInEth} ETH`);
  return await executeSwap({
    amountIn: amountInEth,
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    recipient: WALLET,
  });
}

async function tradeUSDCtoETH(amountInUSDC) {
  console.log(`🚀 Initiating USDC ➡️ ETH swap: ${amountInUSDC} USDC`);
  return await executeSwap({
    amountIn: amountInUSDC,
    tokenIn: USDC_ADDRESS,
    tokenOut: WETH_ADDRESS,
    recipient: WALLET,
  });
}

// Optional example: Simple CLI trigger
async function run() {
  const direction = process.argv[2]; // 'buy' or 'sell'
  const amount = process.argv[3]; // amount in ETH or USDC

  if (!direction || !amount) {
    console.log('❗ Usage: node trader.js [buy|sell] [amount]');
    return;
  }

  if (direction === 'buy') {
    await tradeUSDCtoETH(amount);
  } else if (direction === 'sell') {
    await tradeETHtoUSDC(amount);
  } else {
    console.log('❌ Invalid direction. Use "buy" or "sell".');
  }
}

run();

module.exports = {
  tradeETHtoUSDC,
  tradeUSDCtoETH,
};
