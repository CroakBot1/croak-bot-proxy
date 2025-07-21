const { ethers } = require("ethers"); // ✅ Correct import for ethers v5

// 👉 Your Base chain RPC provider
const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");

// 👉 Replace with your real private key
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xYOUR_PRIVATE_KEY";
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 👉 Uniswap Router + Token addresses
const UNISWAP_ROUTER = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86"; // Base Uniswap v3 router
const USDC = "0xd9aa36f3b9a0a78c63e9f3b44ec1c6e12f6f0fe6"; // Example USDC address
const ETH = "0x4200000000000000000000000000000000000006"; // WETH on Base

// 👉 ERC20 ABI (Minimal)
const ERC20_ABI = [
  "function approve(address spender, uint amount) public returns (bool)",
  "function balanceOf(address owner) public view returns (uint)",
  "function allowance(address owner, address spender) public view returns (uint)"
];

// 👉 Uniswap ABI (Minimal)
const UNISWAP_ABI = [
  "function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

const router = new ethers.Contract(UNISWAP_ROUTER, UNISWAP_ABI, wallet);

async function swapETHtoUSDC(amountInETH) {
  const amountInWei = ethers.utils.parseEther(amountInETH.toString());
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes

  const tx = await router.exactInputSingle({
    tokenIn: ETH,
    tokenOut: USDC,
    fee: 3000,
    recipient: wallet.address,
    deadline,
    amountIn: amountInWei,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  }, { value: amountInWei });

  console.log("Swapped ETH → USDC, TX:", tx.hash);
  await tx.wait();
}

async function swapUSDCtoETH(amountInUSDC) {
  const usdc = new ethers.Contract(USDC, ERC20_ABI, wallet);
  const decimals = 6;
  const amountIn = ethers.utils.parseUnits(amountInUSDC.toString(), decimals);
  const allowance = await usdc.allowance(wallet.address, UNISWAP_ROUTER);

  if (allowance.lt(amountIn)) {
    console.log("Approving USDC...");
    await (await usdc.approve(UNISWAP_ROUTER, ethers.constants.MaxUint256)).wait();
  }

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  const tx = await router.exactInputSingle({
    tokenIn: USDC,
    tokenOut: ETH,
    fee: 3000,
    recipient: wallet.address,
    deadline,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  });

  console.log("Swapped USDC → ETH, TX:", tx.hash);
  await tx.wait();
}

// === AUTO TRIGGER SAMPLE (BOTH SWAP WAYS) ===
// You can replace this with conditions from 61K Brain etc.

async function main() {
  const ethBalance = await provider.getBalance(wallet.address);
  const usdc = new ethers.Contract(USDC, ERC20_ABI, provider);
  const usdcBalance = await usdc.balanceOf(wallet.address);

  console.log("ETH:", ethers.utils.formatEther(ethBalance));
  console.log("USDC:", ethers.utils.formatUnits(usdcBalance, 6));

  // 🔁 Example condition
  if (ethBalance.gt(ethers.utils.parseEther("0.01"))) {
    await swapETHtoUSDC("0.005");
  } else if (usdcBalance.gt(ethers.utils.parseUnits("10", 6))) {
    await swapUSDCtoETH("5");
  } else {
    console.log("Not enough balance to swap");
  }
}

main().catch(console.error);
