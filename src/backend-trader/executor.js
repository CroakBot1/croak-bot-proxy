// src/backend-trader/executor.js

const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL || "https://mainnet.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET = process.env.WALLET;

if (!PRIVATE_KEY || !WALLET) {
  console.error("❌ Missing PRIVATE_KEY or WALLET in environment variables.");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL); // ethers v6 correct usage
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  // Simplified ERC20 ABI
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)"
];

async function getBalance(tokenAddress) {
  const token = new ethers.Contract(tokenAddress, ABI, provider);
  const balance = await token.balanceOf(WALLET);
  const decimals = await token.decimals();
  const symbol = await token.symbol();
  const humanReadable = ethers.formatUnits(balance, decimals);
  console.log(`💰 ${symbol} Balance: ${humanReadable}`);
}

async function sendTokens(tokenAddress, toAddress, amount) {
  const token = new ethers.Contract(tokenAddress, ABI, wallet);
  const decimals = await token.decimals();
  const amountParsed = ethers.parseUnits(amount.toString(), decimals);
  const tx = await token.transfer(toAddress, amountParsed);
  console.log("🚀 Sending tokens... TX:", tx.hash);
  await tx.wait();
  console.log("✅ Sent!");
}

module.exports = {
  getBalance,
  sendTokens,
};
