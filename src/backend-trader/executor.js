const { ethers } = require("ethers");

// Setup provider (Base Mainnet)
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');

// Your wallet private key
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Example token addresses (replace with actual)
const TOKEN_IN = '0x...';   // e.g. ETH
const TOKEN_OUT = '0x...';  // e.g. USDC

// UniswapV2 Router address on Base (or V3 if applicable)
const ROUTER_ADDRESS = '0x...'; // Replace with correct router

// ABI for swapping (basic UniswapV2 example)
const routerAbi = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory)',
  'function approve(address spender, uint256 amount) external returns (bool)'
];

// Connect router
const router = new ethers.Contract(ROUTER_ADDRESS, routerAbi, wallet);

// Sample Buy (ETH → USDC)
async function buy() {
  const path = [TOKEN_IN, TOKEN_OUT];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const tx = await router.swapExactETHForTokens(
    0, // amountOutMin
    path,
    wallet.address,
    deadline,
    { value: ethers.utils.parseEther("0.001") } // 0.001 ETH
  );

  console.log("Buy TX sent:", tx.hash);
}

// Sample Sell (USDC → ETH)
async function sell() {
  const path = [TOKEN_OUT, TOKEN_IN];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const tx = await router.swapExactTokensForETH(
    ethers.utils.parseUnits("10", 6), // Assuming USDC has 6 decimals
    0,
    path,
    wallet.address,
    deadline
  );

  console.log("Sell TX sent:", tx.hash);
}

// Example run
(async () => {
  await buy();
  await sell();
})();
