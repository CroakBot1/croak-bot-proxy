const { ethers } = require('ethers');
const {
  abi: IUniswapV3PoolABI,
} = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json');
const {
  abi: swapRouterABI,
} = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json');

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org'); // Base mainnet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// === CONSTANTS ===
const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap v3 router
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'; // WETH on Base

// === CONTRACTS ===
const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterABI, wallet);

// === HELPERS ===

async function buyETH(amountInUSDC) {
  const amountIn = ethers.utils.parseUnits(amountInUSDC.toString(), 6); // USDC = 6 decimals

  const params = {
    tokenIn: USDC_ADDRESS,
    tokenOut: WETH_ADDRESS,
    fee: 3000, // 0.3%
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const tx = await swapRouter.exactInputSingle(params, {
    gasLimit: 300000,
  });

  console.log(`🟢 Swapping USDC → ETH: TX Hash: ${tx.hash}`);
  await tx.wait();
}

async function sellETH(amountInETH) {
  const amountIn = ethers.utils.parseEther(amountInETH.toString()); // ETH = 18 decimals

  const params = {
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    fee: 3000,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const tx = await swapRouter.exactInputSingle(params, {
    gasLimit: 300000,
  });

  console.log(`🔴 Swapping ETH → USDC: TX Hash: ${tx.hash}`);
  await tx.wait();
}

module.exports = {
  buyETH,
  sellETH,
};
