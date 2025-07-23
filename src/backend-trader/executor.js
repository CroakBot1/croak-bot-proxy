// executor.js
require('dotenv').config();
const Web3 = require('web3');
const { abi: routerAbi } = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const logger = require('./logger');

const web3 = new Web3(process.env.RPC);
const account = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

// ⛽️ Uniswap setup
const router = new web3.eth.Contract(routerAbi, process.env.UNISWAP_ROUTER);
const USDC = process.env.USDC;
const WETH = process.env.WETH;

async function executeBuy(amountInETH) {
  try {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const tx = await router.methods.swapExactETHForTokens(
      0, // Accept any amount of USDC
      [WETH, USDC],
      process.env.WALLET,
      deadline
    ).send({
      from: process.env.WALLET,
      value: web3.utils.toWei(amountInETH.toString(), 'ether'),
      gas: 300000,
    });

    logger.info('✅ BUY Success TX:', tx.transactionHash);
    return tx.transactionHash;

  } catch (err) {
    logger.error('❌ BUY Failed:', err.message);
    return null;
  }
}

async function executeSell(amountInETH) {
  try {
    // NOTE: This assumes you already approved USDC spending.
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    const tx = await router.methods.swapExactTokensForETH(
      web3.utils.toWei(amountInETH.toString(), 'ether'),
      0,
      [USDC, WETH],
      process.env.WALLET,
      deadline
    ).send({
      from: process.env.WALLET,
      gas: 300000,
    });

    logger.info('✅ SELL Success TX:', tx.transactionHash);
    return tx.transactionHash;

  } catch (err) {
    logger.error('❌ SELL Failed:', err.message);
    return null;
  }
}

module.exports = { executeBuy, executeSell };
