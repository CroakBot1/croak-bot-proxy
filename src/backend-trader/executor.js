// == CROAK EXECUTOR v1.0 - INLINE VERSION ==

const { ethers } = require('ethers');

// === CONFIGURATION ===
const PRIVATE_KEY = '1ee0f8d1c5949c7d5d2cb77a8ab2e88d91d6d6c2f934bccb07a949113ecc3776';
const WALLET = '0x08634700dA4c9a33a00e33F7703C7f80fA691836';
const RPC = 'https://mainnet.base.org';
const provider = new ethers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// === TOKEN & ROUTER CONFIG ===
const routerAddress = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86'; // Base Uniswap Router
const tokenIn = '0x4200000000000000000000000000000000000006'; // WETH (BASE)
const tokenOut = '0x845Dc63f84cE1C641625579f82d9bBb5f713Ba03'; // CROAK or any token

// === ABI: Inline Uniswap Router ===
const uniswapRouterAbi = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)'
];

// === ABI: Inline ERC20 ===
const erc20Abi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() view returns (uint8)'
];

// === Contracts ===
const router = new ethers.Contract(routerAddress, uniswapRouterAbi, wallet);
const tokenInContract = new ethers.Contract(tokenIn, erc20Abi, wallet);

// === MAIN EXECUTION ===
async function executeBuy() {
  const amountInEth = '0.0005';
  const amountInWei = ethers.parseEther(amountInEth);

  const path = [tokenIn, tokenOut];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

  // Estimate amountOut
  const amounts = await router.getAmountsOut(amountInWei, path);
  const amountOutMin = amounts[1] - (amounts[1] / BigInt(10)); // slippage 10%

  console.log('[🔁] Executing swap...');
  const tx = await router.swapExactETHForTokens(
    amountOutMin,
    path,
    WALLET,
    deadline,
    { value: amountInWei, gasLimit: 300000 }
  );

  console.log(`[✅] TX Sent: ${tx.hash}`);
  await tx.wait();
  console.log('[🎉] Swap Success!');
}

// === CALL IT! ===
executeBuy().catch((err) => {
  console.error('[❌] ERROR:', err.message);
});
