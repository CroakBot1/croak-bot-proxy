const { ethers } = require('ethers');
const { getSwapTx } = require('./uniswapHelpers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function handleExecution({ tokenIn, tokenOut, amount }) {
  const tx = await getSwapTx({
    wallet,
    amountIn: amount,
    tokenIn,
    tokenOut,
  });

  const sentTx = await wallet.sendTransaction(tx);
  return sentTx.hash;
}

module.exports = { handleExecution };
