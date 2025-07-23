// executor.js
require('dotenv').config();
const Web3 = require('web3');
const axios = require('axios');

// 🔗 Set up Web3
const web3 = new Web3(process.env.BASE_RPC);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// 🧠 Token addresses (BASE network)
const UNISWAP_ROUTER = '0x327Df1E6de05895d2ab08513aaDD9313Fe505d86';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48'; // Mainnet USDC
const WETH = '0xC02aaa39b223FE8D0a0e5C4F27eAD9083C756Cc2'; // Mainnet WETH

// ⛽ Gas settings
const GAS_LIMIT = 300000;

const routerABI = [ // 💡 Only the required swapExactETHForTokens and swapExactTokensForETH
  {
    "name": "swapExactETHForTokens",
    "type": "function",
    "stateMutability": "payable",
    "inputs": [
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [{ "name": "amounts", "type": "uint256[]" }]
  },
  {
    "name": "swapExactTokensForETH",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [{ "name": "amounts", "type": "uint256[]" }]
  }
];

const router = new web3.eth.Contract(routerABI, UNISWAP_ROUTER);

module.exports = {
  async buy(amountETH) {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const amountInWei = web3.utils.toWei(amountETH.toString(), 'ether');

    const tx = await router.methods.swapExactETHForTokens(
      0,
      [WETH, USDC],
      account.address,
      deadline
    ).send({
      from: account.address,
      value: amountInWei,
      gas: GAS_LIMIT
    });

    console.log('✅ BUY TX Success:', tx.transactionHash);
    return tx.transactionHash;
  },

  async sell(amountETH) {
    // In a real implementation, you’d first approve the router to spend USDC
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const amountInWei = web3.utils.toWei(amountETH.toString(), 'ether');

    const tx = await router.methods.swapExactTokensForETH(
      amountInWei,
      0,
      [USDC, WETH],
      account.address,
      deadline
    ).send({
      from: account.address,
      gas: GAS_LIMIT
    });

    console.log('✅ SELL TX Success:', tx.transactionHash);
    return tx.transactionHash;
  }
};
