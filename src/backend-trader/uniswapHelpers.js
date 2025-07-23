const { ethers } = require('ethers');

const swapRouterAbi = [
  'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)'
];

function getDeadline() {
  return Math.floor(Date.now() / 1000) + 60;
}

function toRaw(amount) {
  return ethers.parseUnits(amount.toString(), 18);
}

async function getSwapTx({ wallet, amountIn, tokenIn, tokenOut }) {
  const router = new ethers.Contract(process.env.UNISWAP_ROUTER, swapRouterAbi, wallet);
  const rawAmount = toRaw(amountIn);

  const params = {
    tokenIn,
    tokenOut,
    fee: 500,
    recipient: await wallet.getAddress(),
    deadline: getDeadline(),
    amountIn: rawAmount,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  };

  const iface = new ethers.Interface(swapRouterAbi);
  const data = iface.encodeFunctionData('exactInputSingle', [params]);

  return {
    to: process.env.UNISWAP_ROUTER,
    data,
    value: tokenIn === ethers.ZeroAddress ? rawAmount : 0,
    gasLimit: ethers.hexlify(750000)
  };
}

module.exports = { getSwapTx };
