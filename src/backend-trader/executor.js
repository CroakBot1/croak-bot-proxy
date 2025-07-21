// executor.js

const { ethers } = require('ethers');

// ✅ ERC20 ABI (inline)
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)"
];

// ✅ Uniswap Router ABI (inline)
const uniswapRouterABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

// ✅ CONFIG (Update ni with your values)
const RPC_URL = 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY';
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // ⚠️ NEVER share this
const ROUTER_ADDRESS = '0xUniswapRouterAddress'; // Example: UniswapV2
const TOKEN_IN = '0xTokenInAddress';   // e.g., USDT
const TOKEN_OUT = '0xTokenOutAddress'; // e.g., WETH
const AMOUNT_IN = '10'; // in human-readable units (e.g., 10 USDT)

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const tokenIn = new ethers.Contract(TOKEN_IN, erc20ABI, wallet);
  const router = new ethers.Contract(ROUTER_ADDRESS, uniswapRouterABI, wallet);

  try {
    const decimals = await tokenIn.decimals();
    const amountInWei = ethers.parseUnits(AMOUNT_IN, decimals);

    // ✅ Step 1: Approve if needed
    const allowance = await tokenIn.allowance(wallet.address, ROUTER_ADDRESS);
    if (allowance < amountInWei) {
      console.log('🔓 Approving token...');
      const tx = await tokenIn.approve(ROUTER_ADDRESS, ethers.MaxUint256);
      await tx.wait();
      console.log('✅ Approved.');
    } else {
      console.log('🔒 Already approved.');
    }

    // ✅ Step 2: Get estimated amountOut
    const path = [TOKEN_IN, TOKEN_OUT];
    const amountsOut = await router.getAmountsOut(amountInWei, path);
    const amountOutMin = amountsOut[1] * 0.98n; // 2% slippage

    console.log(`📈 Expected output: ${ethers.formatUnits(amountsOut[1], decimals)}`);

    // ✅ Step 3: Execute the swap
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes
    const tx = await router.swapExactTokensForTokens(
      amountInWei,
      amountOutMin,
      path,
      wallet.address,
      deadline,
      {
        gasLimit: 300000
      }
    );
    const receipt = await tx.wait();
    console.log('✅ Swap successful:', receipt.transactionHash);

  } catch (err) {
    console.error('❌ ERROR:', err.message || err);
  }
})();
