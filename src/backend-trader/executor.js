// executor.js

require('dotenv').config();
const { ethers } = require("ethers");
const axios = require("axios");

// ENV
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;

// Base Chain RPC
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Uniswap Router on Base
const UNISWAP_ROUTER = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86";
const router = new ethers.Contract(
  UNISWAP_ROUTER,
  [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory)"
  ],
  signer
);

// USDC address on Base
const USDC = "0xd9AA94D7E1696DAA0d84DC2e133D08c7387dF1f2";

// Approve ERC20
const ERC20_ABI = [
  "function approve(address spender, uint amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint)",
  "function balanceOf(address account) view returns (uint256)"
];
const usdcContract = new ethers.Contract(USDC, ERC20_ABI, signer);

async function getETHPriceUSD() {
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    return res.data.ethereum.usd;
  } catch (e) {
    console.error("[❌ ERROR] Failed to fetch ETH price:", e.message);
    return null;
  }
}

// BUY USDC with ETH
async function buyUSDCWithETH(ethAmount) {
  try {
    const ethPrice = await getETHPriceUSD();
    const usdcOutMin = ethAmount * ethPrice * 0.95; // 5% slippage buffer
    const amountOutMin = ethers.parseUnits(usdcOutMin.toFixed(2), 6);

    const tx = await router.swapExactETHForTokens(
      amountOutMin,
      ["0x4200000000000000000000000000000000000006", USDC], // ETH > USDC path
      WALLET,
      Math.floor(Date.now() / 1000) + 60,
      { value: ethers.parseEther(ethAmount.toString()), gasLimit: 250000 }
    );

    console.log(`[✅ BUY] TX sent: ${tx.hash}`);
    await tx.wait();
    console.log("[✅ BUY] Success!");
  } catch (err) {
    console.error("[❌ BUY ERROR]", err.reason || err.message);
  }
}

// SELL USDC for ETH
async function sellUSDCForETH(usdcAmount) {
  try {
    const ethPrice = await getETHPriceUSD();
    const ethOutMin = (usdcAmount / ethPrice) * 0.95;
    const amountOutMin = ethers.parseUnits(ethOutMin.toFixed(6), 18);

    const amountIn = ethers.parseUnits(usdcAmount.toString(), 6);

    const allowance = await usdcContract.allowance(WALLET, UNISWAP_ROUTER);
    if (allowance < amountIn) {
      const approveTx = await usdcContract.approve(UNISWAP_ROUTER, amountIn);
      await approveTx.wait();
      console.log("[🔓 APPROVED] USDC approved for swap.");
    }

    const tx = await router.swapExactTokensForETH(
      amountIn,
      amountOutMin,
      [USDC, "0x4200000000000000000000000000000000000006"], // USDC > ETH path
      WALLET,
      Math.floor(Date.now() / 1000) + 60,
      { gasLimit: 250000 }
    );

    console.log(`[✅ SELL] TX sent: ${tx.hash}`);
    await tx.wait();
    console.log("[✅ SELL] Success!");
  } catch (err) {
    console.error("[❌ SELL ERROR]", err.reason || err.message);
  }
}

// Export functions for trader.js
module.exports = {
  buyUSDCWithETH,
  sellUSDCForETH
};
