const { ethers } = require('ethers');

const USDC_ADDRESS = '0xd9AA094C8b3B869D95fC2eE6dA1dA4BCCeAaB7D0';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 Router
const SLIPPAGE_TOLERANCE = 0.01;

function getDeadline() {
  return Math.floor(Date.now() / 1000) + 60;
}

function toRaw(amount, decimals = 18) {
  return ethers.parseUnits(amount.toString(), decimals);
}

const swapRouterAbi = [
  'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)'
];

async function getSwapTx({ wallet, amountIn, tokenIn, tokenOut }) {
  const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterAbi, wallet);
  const fee = 500; // 0.05%
  const rawAmountIn = toRaw(amountIn, 18);
  const amountOutMinimum = 0; // You can calculate this from a price oracle
  const deadline = getDeadline();

  const params = {
    tokenIn,
    tokenOut,
    fee,
    recipient: await wallet.getAddress(),
    deadline,
    amountIn: rawAmountIn,
    amountOutMinimum,
    sqrtPriceLimitX96: 0,
  };

  const iface = new ethers.Interface(swapRouterAbi);
  const data = iface.encodeFunctionData('exactInputSingle', [params]);

  return {
    to: SWAP_ROUTER_ADDRESS,
    data,
    value: tokenIn === ethers.ZeroAddress ? rawAmountIn : 0,
    gasLimit: ethers.hexlify(700000),
  };
}

module.exports = {
  USDC_ADDRESS,
  WETH_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  SLIPPAGE_TOLERANCE,
  getDeadline,
  toRaw,
  getSwapTx,
};
