// executor.js
require("dotenv").config();
const { ethers } = require("ethers");
const ERC20ABI = require("./abi/erc20.json");

const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// UNISWAP V3 Router address on BASE
const UNISWAP_V3_ROUTER = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";

// Basic SwapRouter ABI with only exactInputSingle function
const SWAP_ROUTER_ABI = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) payable returns (uint256)"
];

// Token addresses on BASE
const TOKENS = {
  USDC: "0xd9AaF93bFfe51a730a8236f3F00EfA2bB7F5d2eD",
  WETH: "0x4200000000000000000000000000000000000006", // Native WETH on Base
  ETH: "0x4200000000000000000000000000000000000006", // Alias (ETH as WETH)
};

const router = new ethers.Contract(UNISWAP_V3_ROUTER, SWAP_ROUTER_ABI, wallet);

async function approveToken(tokenAddress, spender, amount) {
  const token = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
  const allowance = await token.allowance(wallet.address, spender);
  if (allowance < amount) {
    console.log("Approving token...");
    const tx = await token.approve(spender, amount);
    await tx.wait();
    console.log("Approved.");
  }
}

async function swapUSDCtoETH(amountInDecimal) {
  const amountIn = ethers.parseUnits(amountInDecimal.toString(), 6); // USDC is 6 decimals

  await approveToken(TOKENS.USDC, UNISWAP_V3_ROUTER, amountIn);

  const params = {
    tokenIn: TOKENS.USDC,
    tokenOut: TOKENS.ETH,
    fee: 500,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 5,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  console.log("Swapping USDC → ETH...");
  const tx = await router.exactInputSingle(params);
  const receipt = await tx.wait();
  console.log("Swap complete:", receipt.transactionHash);
}

(async () => {
  try {
    await swapUSDCtoETH("1"); // Example: swap 1 USDC
  } catch (err) {
    console.error("Swap failed:", err.message);
  }
})();
