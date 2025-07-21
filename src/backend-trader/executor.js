// executor.js
const axios = require('axios');
const ethers = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 0x Swap API endpoint (Base network)
const API_URL = 'https://base.api.0x.org/swap/v1/quote';

const TOKENS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // Replace with Base USDC if needed
  WETH: '0x4200000000000000000000000000000000000006'
};

async function executeSwap(fromToken, toToken, amount, slippage = 1.0) {
  try {
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 6); // For USDC (6 decimals)

    const response = await axios.get(API_URL, {
      params: {
        buyToken: toToken,
        sellToken: fromToken,
        sellAmount: amountInWei.toString(),
        takerAddress: wallet.address,
        slippagePercentage: slippage / 100,
      },
    });

    const { to, data, value, gas } = response.data;

    const tx = await wallet.sendTransaction({
      to,
      data,
      value: ethers.BigNumber.from(value || '0'),
      gasLimit: ethers.BigNumber.from(gas || '500000'),
    });

    console.log(`🔄 Swap Tx Sent: ${tx.hash}`);
    await tx.wait();
    console.log(`✅ Swap Confirmed: ${tx.hash}`);
  } catch (err) {
    console.error('❌ Swap Failed:', err.message);
  }
}

module.exports = {
  buy: async (amountInUSDC) => {
    console.log(`🚀 Buying ETH with ${amountInUSDC} USDC`);
    await executeSwap(TOKENS.USDC, TOKENS.WETH, amountInUSDC);
  },
  sell: async (amountInUSDC) => {
    console.log(`💰 Selling ETH for ${amountInUSDC} USDC`);
    await executeSwap(TOKENS.WETH, TOKENS.USDC, amountInUSDC);
  }
};
