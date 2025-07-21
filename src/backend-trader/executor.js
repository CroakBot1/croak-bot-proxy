// executor.js (CommonJS fixed version for Node.js)
const { JsonRpcProvider, Wallet, Contract } = require('ethers');
const logger = require('./logger');

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET;
const RPC_URL = 'https://mainnet.base.org';

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

// UniswapV2 router contract (Base chain - change if needed)
const routerAddress = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
const routerABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
  'function WETH() external pure returns (address)',
];

const router = new Contract(routerAddress, routerABI, wallet);

async function buyETH() {
  try {
    const amountInETH = '0.001'; // Change your buy amount
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const WETH = await router.WETH();
    const path = [WETH, WALLET_ADDRESS]; // Replace with desired token address

    const tx = await router.swapExactETHForTokens(
      0, // amountOutMin: accept any amount
      path,
      wallet.address,
      deadline,
      { value: ethers.utils.parseEther(amountInETH) }
    );

    logger.success(`🟢 BUY EXECUTED: ${tx.hash}`);
  } catch (err) {
    logger.error('❌ Error during BUY execution:', err.message);
  }
}

async function sellETH() {
  try {
    const amountIn = ethers.utils.parseEther('0.001'); // Replace with your amount
    const deadline = Math.floor(Date.now() / 1000) + 60 * 5;

    const WETH = await router.WETH();
    const path = [WALLET_ADDRESS, WETH]; // Replace with desired token address

    const tx = await router.swapExactTokensForETH(
      amountIn,
      0, // amountOutMin: accept any amount
      path,
      wallet.address,
      deadline
    );

    logger.success(`🔴 SELL EXECUTED: ${tx.hash}`);
  } catch (err) {
    logger.error('❌ Error during SELL execution:', err.message);
  }
}

module.exports = {
  buyETH,
  sellETH,
};
