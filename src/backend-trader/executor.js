require('dotenv').config();
const ethers = require('ethers');

// === CONFIG ===
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const RPC_URL = "https://mainnet.base.org";
const TOKEN_IN = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // ETH (example)
const TOKEN_OUT = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC (example)
const AMOUNT_IN = ethers.utils.parseUnits("0.001", "ether"); // 0.001 ETH
const ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router

// === INIT ===
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// === ABI for Uniswap V3 Router exactInputSingle ===
const routerAbi = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)"
];

// === Core Swap Logic ===
async function swapExactInputSingle() {
  const router = new ethers.Contract(ROUTER, routerAbi, wallet);

  const params = {
    tokenIn: TOKEN_IN,
    tokenOut: TOKEN_OUT,
    fee: 3000,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn: AMOUNT_IN,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  };

  try {
    const tx = await router.exactInputSingle(params, {
      value: TOKEN_IN === ethers.constants.AddressZero ? AMOUNT_IN : 0,
      gasLimit: 300000
    });

    console.log("[✅ TX SENT]", tx.hash);
    const receipt = await tx.wait();
    console.log("[🎉 TX MINED]", receipt.transactionHash);
  } catch (err) {
    console.error("[❌ ERROR]", err);
  }
}

// === EXECUTE ===
swapExactInputSingle();
