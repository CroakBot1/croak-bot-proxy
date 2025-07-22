require('dotenv').config();
const { ethers } = require('ethers');
const {
  USDC_ADDRESS,
  WETH_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  SLIPPAGE_TOLERANCE,
  getDeadline,
  toRaw,
} = require('./uniswapHelpers');

// 🔒 Connect logger.js
const logger = require('./logger');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const WALLET = process.env.WALLET;

const abi = [
  'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)',
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, abi, signer);

// ✅ Log that connection is established
logger.info(`🔗 executor.js connected to logger.js`);
logger.info(`🔐 Connected to wallet: ${signer.address}`);

async function executeSwap({ amountIn, tokenIn, tokenOut, recipient = WALLET, slippage = SLIPPAGE_TOLERANCE }) {
  try {
    logger.info(`[🧠 EXEC SWAP] Wallet: ${signer.address}`);
    logger.info(`[🧪 Params] ${tokenIn} ➡️ ${tokenOut} | Amount: ${amountIn} | Slippage: ${slippage}`);

    const decimals = tokenIn === USDC_ADDRESS ? 6 : 18;
    const amountInRaw = toRaw(amountIn, decimals);

    const params = {
      tokenIn,
      tokenOut,
      fee: 3000,
      recipient,
      deadline: getDeadline(),
      amountIn: amountInRaw,
      amountOutMinimum: 0, // Improve later for actual slippage logic
      sqrtPriceLimitX96: 0,
    };

    const tx = await swapRouter.exactInputSingle(params, {
      value: tokenIn === WETH_ADDRESS ? amountInRaw : 0,
      gasLimit: ethers.utils.hexlify(800000),
    });

    logger.info(`[TX] 📤 Sent: ${tx.hash}`);
    const receipt = await tx.wait();
    logger.info(`[✅] Confirmed: ${receipt.transactionHash}`);
    return receipt;
  } catch (err) {
    logger.error(`[❌ ERROR] Swap failed:`, err);
    return null;
  }
}

module.exports = { executeSwap };
