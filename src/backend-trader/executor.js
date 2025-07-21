// executor.js – FIXED FOR ethers v6.x compatibility

const { ethers } = require('ethers');
require('dotenv').config();
const { PRIVATE_KEY, RPC_URL } = process.env;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function executeTrade(type, tokenIn, tokenOut, amountIn) {
  console.log(`🟡 Executing ${type} trade...`);

  try {
    const routerAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 Router
    const routerAbi = [
      'function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)'
    ];

    const routerContract = new ethers.Contract(routerAddress, routerAbi, wallet);

    const params = {
      tokenIn,
      tokenOut,
      fee: 3000, // 0.3%
      recipient: await wallet.getAddress(),
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: ethers.parseUnits(amountIn.toString(), 18),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    };

    const tx = await routerContract.exactInputSingle(params, {
      value: ethers.parseEther('0') // send ETH only if tokenIn is ETH
    });

    console.log(`✅ Trade sent: ${tx.hash}`);
    await tx.wait();
    console.log('🎉 Trade confirmed!');
  } catch (err) {
    console.error('❌ Error executing trade:', err.message);
  }
}

module.exports = { executeTrade };
