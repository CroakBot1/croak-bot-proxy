// executor.js – Clean ETH ⇄ USDC swap executor for Uniswap on Base chain
require('dotenv').config();
const { ethers } = require('ethers');

// === ENVIRONMENT SETUP ===
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// === UNISWAP ROUTER (Base Mainnet) ===
const UNISWAP_ROUTER = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
const routerAbi = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)"
];

const router = new ethers.Contract(UNISWAP_ROUTER, routerAbi, wallet);

// === TOKEN ADDRESSES (Base Mainnet) ===
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0xd9aa7a6Af7bF8F6F3E4d3eEFA2E6fEb6587e3Ba0"; // USDC (Base)

const usdcAbi = [
  "function approve(address spender, uint amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const usdc = new ethers.Contract(USDC, usdcAbi, wallet);

// === UTILITY: Get ETH → USDC quote ===
async function getPriceETHtoUSDC(amountInEth) {
  const amountIn = ethers.utils.parseEther(amountInEth.toString());
  const path = [WETH, USDC];
  const amounts = await router.getAmountsOut(amountIn, path);
  return ethers.utils.formatUnits(amounts[1], 6); // USDC has 6 decimals
}

// === BUY FUNCTION: Swap ETH → USDC ===
async function buyUSDCwithETH(amountInEth) {
  const amountIn = ethers.utils.parseEther(amountInEth.toString());
  const path = [WETH, USDC];
  const deadline = Math.floor(Date.now() / 1000) + 60;

  const minOut = await router.getAmountsOut(amountIn, path);
  const amountOutMin = minOut[1].mul(98).div(100); // 2% slippage buffer

  const tx = await router.swapExactETHForTokens(
    amountOutMin,
    path,
    WALLET_ADDRESS,
    deadline,
    { value: amountIn }
  );

  console.log("🟢 Buying USDC... TX:", tx.hash);
  await tx.wait();
  console.log("✅ Swap Complete");
}

// === SELL FUNCTION: Swap USDC → ETH ===
async function sellUSDCforETH(amountInUSDC) {
  const amountIn = ethers.utils.parseUnits(amountInUSDC.toString(), 6);
  const path = [USDC, WETH];
  const deadline = Math.floor(Date.now() / 1000) + 60;

  // Approve router if needed
  const allowance = await usdc.allowance(WALLET_ADDRESS, UNISWAP_ROUTER);
  if (allowance.lt(amountIn)) {
    const approveTx = await usdc.approve(UNISWAP_ROUTER, amountIn);
    console.log("🔁 Approving USDC for Uniswap...");
    await approveTx.wait();
  }

  const minOut = await router.getAmountsOut(amountIn, path);
  const amountOutMin = minOut[1].mul(98).div(100); // 2% slippage buffer

  const tx = await router.swapExactTokensForETH(
    amountIn,
    amountOutMin,
    path,
    WALLET_ADDRESS,
    deadline
  );

  console.log("🔴 Selling USDC... TX:", tx.hash);
  await tx.wait();
  console.log("✅ Swap Complete");
}

// === MAIN TEST ===
async function main() {
  console.log("🌐 Wallet:", await wallet.getAddress());
  const price = await getPriceETHtoUSDC(0.01);
  console.log("💱 0.01 ETH ≈", price, "USDC");

  // await buyUSDCwithETH(0.01); // Uncomment to BUY
  // await sellUSDCforETH(10);   // Uncomment to SELL
}

main();
