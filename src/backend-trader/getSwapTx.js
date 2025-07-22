// getSwapTx.js

const { ethers } = require('ethers');
const {
  SWAP_ROUTER_ADDRESS,
  getDeadline,
  toRaw
} = require('./uniswapHelpers');

// ✅ Uniswap V3 SwapRouter ABI (minimal required)
const swapRouterAbi = [
  'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)'
];

// 🔄 Generate Swap Transaction
async function getSwapTx({ wallet, amountIn, tokenIn, tokenOut, slippage = 0.01 }) {
  const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterAbi, wallet);

  // Define the fee tier (Base uses 0.05% = 500 for most tokens)
  const fee = 500;

  // Calculate minimum output after slippage
  const rawAmountIn = toRaw(amountIn, 18); // Assuming tokenIn is ETH (18 decimals)

  // ⚠️ If you're dealing with non-18 decimal tokens (like USDC), adjust accordingly.
  const amountOutMinimum = 0; // Optional: Set to 0 to accept any amount (use slippage calc here if needed)

  // Deadline in seconds (current time + 60s)
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

  const iface = new ethers.utils.Interface(swapRouterAbi);
  const data = iface.encodeFunctionData('exactInputSingle', [params]);

  return {
    to: SWAP_ROUTER_ADDRESS,
    data,
    value: tokenIn === ethers.constants.AddressZero ? rawAmountIn : 0,
    gasLimit: ethers.utils.hexlify(700000), // Safe upper bound
  };
}

module.exports = { getSwapTx };

