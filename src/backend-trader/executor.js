require('dotenv').config();
const { ethers } = require('ethers');

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Change to correct router if needed
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const routerABI = [
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory)"
];

const router = new ethers.Contract(UNISWAP_ROUTER, routerABI, signer);

async function buyToken(tokenAddress, ethAmount) {
  const path = ["0x4200000000000000000000000000000000000006", tokenAddress]; // BASE ➜ token
  const tx = await router.swapExactETHForTokens(
    0, path, signer.address, Math.floor(Date.now() / 1000) + 60 * 2,
    { value: ethers.utils.parseEther(ethAmount) }
  );
  console.log('Buy TX Hash:', tx.hash);
  await tx.wait();
  console.log('✅ Token bought!');
}

async function sellToken(tokenAddress) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const balance = await token.balanceOf(signer.address);
  const path = [tokenAddress, "0x4200000000000000000000000000000000000006"]; // token ➜ BASE

  // Approve router
  const allowance = await token.allowance(signer.address, UNISWAP_ROUTER);
  if (allowance.lt(balance)) {
    const approvalTx = await token.approve(UNISWAP_ROUTER, balance);
    await approvalTx.wait();
    console.log('✅ Approved for selling.');
  }

  const tx = await router.swapExactTokensForETH(
    balance, 0, path, signer.address, Math.floor(Date.now() / 1000) + 60 * 2
  );
  console.log('Sell TX Hash:', tx.hash);
  await tx.wait();
  console.log('✅ Token sold!');
}

module.exports = { buyToken, sellToken };
