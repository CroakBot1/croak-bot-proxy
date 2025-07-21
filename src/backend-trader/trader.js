const { getLatestPrice } = require('./priceFetcher');
const { shouldBuy, shouldSell } = require('./strategy');
const logger = require('./logger');
const ethers = require('ethers');
const ERC20_ABI = require('./erc20-abi.json');

// === CONFIG ===
const RPC_URL = 'https://mainnet.base.org'; // BASE MAINNET RPC
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = '0xYourWalletAddress';

// === UNISWAP ROUTER FOR BASE ===
const UNISWAP_ROUTER_ADDRESS = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86'; // Uniswap v3 Router on Base
const UNISWAP_ROUTER_ABI = require('./uniswap-router-abi.json');

// === TOKEN CONFIG (EXAMPLE: ETH -> USDC) ===
const tokenIn = '0x4200000000000000000000000000000000000006';   // WETH
const tokenOut = '0xD9aaC4c1403e0B06C1d0D2C6a0f0Ee88b6C60a3B';  // USDC on Base

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, wallet);

async function approveToken(amountIn) {
  const token = new ethers.Contract(tokenIn, ERC20_ABI, wallet);
  const allowance = await token.allowance(wallet.address, UNISWAP_ROUTER_ADDRESS);
  if (allowance < amountIn) {
    const tx = await token.approve(UNISWAP_ROUTER_ADDRESS, amountIn);
    await tx.wait();
    logger.info(`✅ Approved ${amountIn} of tokenIn`);
  }
}

async function swapTokens(amountIn, minAmountOut) {
  await approveToken(amountIn);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

  const tx = await router.exactInputSingle({
    tokenIn,
    tokenOut,
    fee: 500, // 0.05% pool
    recipient: wallet.address,
    deadline,
    amountIn,
    amountOutMinimum: minAmountOut,
    sqrtPriceLimitX96: 0
  });

  const receipt = await tx.wait();
  logger.info(`🟢 Swap executed: ${receipt.transactionHash}`);
}

// === MAIN FUNCTION ===
async function checkPriceAndTrade() {
  try {
    const price = await getLatestPrice();
    logger.info(`📊 Current ETH price from Bybit: ${price}`);

    const amountIn = ethers.parseUnits('0.01', 18); // amount of WETH to use
    const minAmountOut = ethers.parseUnits('5', 6); // slippage protection (example)

    if (await shouldBuy(price)) {
      logger.info('📈 BUY signal triggered');
      await swapTokens(amountIn, minAmountOut);
    } else if (await shouldSell(price)) {
      logger.info('📉 SELL signal triggered');
      await swapTokens(amountIn, minAmountOut);
    } else {
      logger.info('🤖 No action taken (neutral)');
    }
  } catch (err) {
    logger.error('🔥 Error during checkPriceAndTrade', err);
  }
}

module.exports = {
  checkPriceAndTrade
};
