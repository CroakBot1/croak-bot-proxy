// uniswapHelpers.js
const { ethers } = require('ethers');
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json').abi;
const IUniswapRouterABI = require('@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json').abi;

const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

async function getPoolImmutables(provider, tokenA, tokenB) {
  const factory = new ethers.Contract(
    '0x1F98431c8aD98523631AE4a59f267346ea31F984', // Uniswap V3 Factory
    ['function getPool(address,address,uint24) view returns (address)'],
    provider
  );

  const fee = 3000;
  const poolAddress = await factory.getPool(tokenA.address, tokenB.address, fee);

  return {
    poolAddress,
    fee
  };
}

async function getPoolState(provider, poolAddress) {
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
  const slot = await poolContract.slot0();
  const liquidity = await poolContract.liquidity();
  return {
    sqrtPriceX96: slot[0],
    liquidity,
    tick: slot[1]
  };
}

function getSwapRouterContract(wallet) {
  return new ethers.Contract(SWAP_ROUTER_ADDRESS, IUniswapRouterABI, wallet);
}

module.exports = {
  getPoolImmutables,
  getPoolState,
  getSwapRouterContract
};

