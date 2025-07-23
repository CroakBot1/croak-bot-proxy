// == SIGNAL.JS ==
// Price Signal Detector + Executor Trigger

const logger = require('./logger');
const { getCurrentPrice } = require('./priceFetcher');
const { swapEthToUsdc } = require('./executor');

// ✅ Strategy Thresholds
const BUY_THRESHOLD = 2850;   // Example: Buy ETH below $2850
const SELL_THRESHOLD = 3550;  // Example: Sell ETH above $3550

// ✅ Trade Amount in ETH
const TRADE_AMOUNT_ETH = 0.01;

// ✅ Signal Check Loop
async function checkSignalAndExecute() {
  try {
    logger.info("⏳ Running 61K strategy check...");

    const ethPrice = await getCurrentPrice();
    logger.info("📈 ETH Current Price:", ethPrice);

    if (ethPrice < BUY_THRESHOLD) {
      logger.info("✅ BUY Signal Detected 🟢");
      await swapEthToUsdc(TRADE_AMOUNT_ETH); // ⚡ Execute trade
    } else if (ethPrice > SELL_THRESHOLD) {
      logger.info("⚠️ SELL Signal Detected 🔴");
      logger.warn("💤 SELL logic not implemented yet...");
      // TODO: swapUsdcToEth(); if needed
    } else {
      logger.info("⏸️ No clear signal. Waiting...");
    }

  } catch (err) {
    logger.error("💥 Error during signal check:", err);
  }
}

// ✅ Auto-loop every 30s
setInterval(checkSignalAndExecute, 30 * 1000);
