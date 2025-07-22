// getSwapTx.js

const { ethers } = require('ethers');
const {
  getDeadline,
  toRaw,
  SWAP_ROUTER_ADDRESS,
  SLIPPAGE_TOLERANCE,
  USDC_ADDRESS,
  WETH_ADDRESS,
} = require('./uniswapHelpers');

const IERC20_ABI = ['function decimals() view returns (uint8)'];

// Utility to get decimals of a token
async function getTokenDecimals(tokenAddress, provider) {
  const contract = new ethers.Contract(tokenAddress, IERC20_ABI, provider);
  return await contract.decimals();
}

async function getSwapTx({
  provider,
  wallet,
  amountIn,
  tokenIn,
  tokenOut,
  slippage = SLIPPAGE_TOLERANCE,
}) {
  const router = new ethers.Contract(
    SWAP_ROUTER_ADDRESS,
    [
      'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)'
    ],
    wallet
  );

  const tokenInDecimals = await getTokenDecimals(tokenIn, provider);
  const tokenOutDecimals = await getTokenDecimals(tokenOut, provider);

  const amountInRaw = toRaw(amountIn, tokenInDecimals);

  const minAmountOut = amountInRaw
    .mul(ethers.BigNumber.from(10000 - slippage * 10000))
    .div(10000);

  const recipient = await wallet.getAddress();

  const params = {
    tokenIn,
    tokenOut,
    fee: 3000,
    recipient,
    deadline: getDeadline(),
    amountIn: amountInRaw,
    amountOutMinimum: minAmountOut,
    sqrtPriceLimitX96: 0,
  };

  const overrides = {};
  if (tokenIn.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
    overrides.value = amountInRaw;
  }

  return {
    tx: await router.populateTransaction.exactInputSingle(params, overrides),
    tokenInDecimals,
    tokenOutDecimals,
    amountInRaw,
    minAmountOut,
  };
}

module.exports = { getSwapTx };
