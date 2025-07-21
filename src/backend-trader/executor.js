// == Uniswap BASE Chain Trade Executor ==
// Description: Buys ETH using USDC on Base Chain via Uniswap V3

const { ethers } = require("ethers");
const { abi: swapRouterAbi } = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
require("dotenv").config();

// === ENVIRONMENT ===
const PRIVATE_KEY = "1ee0f8d1c5949c7d5d2cb77a8ab2e88d91d6d6c2f934bccb07a949113ecc3776";
const WALLET_ADDRESS = "0x08634700dA4c9a33a00e33F7703C7f80fA691836";
const RPC_URL = "https://mainnet.base.org";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// === UNISWAP CONFIG ===
const SWAP_ROUTER_ADDRESS = "0x327Df1E6de05895d2ab08513aaDD9313Fe505d86"; // Base chain SwapRouter
const swapRouter = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterAbi, wallet);

// === TOKENS ===
const USDC = {
    address: "0xd9AA94D5360A203dE21B7177BbCbD8cD2c82D2C2",
    decimals: 6
};

const WETH = {
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18
};

// === SWAP FUNCTION ===
async function swapUSDCtoWETH(amountInUSDC) {
    const amountIn = ethers.utils.parseUnits(amountInUSDC.toString(), USDC.decimals);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    // Approve router to spend USDC
    const usdcContract = new ethers.Contract(USDC.address, ["function approve(address spender, uint256 amount) public returns (bool)"], wallet);
    const approvalTx = await usdcContract.approve(SWAP_ROUTER_ADDRESS, amountIn);
    await approvalTx.wait();
    console.log("✅ Approved USDC for swap");

    const params = {
        tokenIn: USDC.address,
        tokenOut: WETH.address,
        fee: 500, // 0.05%
        recipient: WALLET_ADDRESS,
        deadline,
        amountIn,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
    };

    const tx = await swapRouter.exactInputSingle(params, { gasLimit: 800000 });
    console.log("🚀 Swap Transaction Hash:", tx.hash);
    await tx.wait();
    console.log("🎉 Swap Complete");
}

// === EXECUTE ===
swapUSDCtoWETH("10") // <-- swap 10 USDC to WETH
    .catch(console.error);
