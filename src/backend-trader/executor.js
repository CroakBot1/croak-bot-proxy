// executor.js
const { ethers } = require('ethers');
const {
  getPoolImmutables,
  getPoolState,
  getSwapRouterContract,
} = require('./uniswapHelpers');

const { Token, CurrencyAmount, TradeType, Percent } = require('@uniswap/sdk-core');
const { Pool, Route, Trade, SwapRouter } = require('@uniswap/v3-sdk');

const logger = require('./logger');
require('dotenv').config();

// 🔐 Private key and RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 🪙 Token setup
const ETH = new Token(1, '0xC02aaA39b223FE8D0a0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');
const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin');

// ✅ Main swap execution function
async function executeSwap(inputToken, outputToken, inputAmountRaw) {
  try {
    const poolInfo = await getPoolImmutables(provider, inputToken, outputToken);
    const poolState = await getPoolState(provider, poolInfo.poolAddress);

    const pool = new Pool(
      inputToken,
      outputToken,
      poolInfo.fee,
      poolState.sqrtPriceX96.toString(),
      poolState.liquidity.toString(),
      poolState.tick
    );

    const swapRoute = new Route([pool], inputToken, outputToken);

    const amountIn = CurrencyAmount.fromRawAmount(inputToken, inputAmountRaw);
    const trade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: amountIn,
      outputAmount: swapRoute.midPrice.quote(amountIn),
      tradeType: TradeType.EXACT_INPUT,
    });

    const swapRouter = getSwapRouterContract(wallet);
    const slippageTolerance = new Percent('50', '10000'); // 0.50%

    const { calldata, value } = SwapRouter.swapCallParameters([trade], {
      slippageTolerance,
      recipient: wallet.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 5, // 5 mins
    });

    const tx = await swapRouter.sendTransaction({
      data: calldata,
      value: ethers.BigNumber.from(value),
      gasLimit: 300000,
    });

    logger.info(`🚀 Executed swap: ${inputToken.symbol} → ${outputToken.symbol}`);
    logger.info(`🔗 TX: ${tx.hash}`);
  } catch (err) {
    logger.error('❌ Swap execution failed:', err.message);
  }
}

// 🔄 BUY: USDC → ETH
async function buyETH() {
  const amountIn = ethers.utils.parseUnits('50', 6); // Example: $50 USDC
  await executeSwap(USDC, ETH, amountIn.toString());
}

// 🔄 SELL: ETH → USDC
async function sellETH() {
  const amountIn = ethers.utils.parseUnits('0.02', 18); // Example: 0.02 ETH
  await executeSwap(ETH, USDC, amountIn.toString());
}

module.exports = {
  buyETH,
  sellETH,
};
