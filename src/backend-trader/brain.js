// brain.js (Frontend version)

// Brain Memory Score
let brainMemoryScore = 50;

// 🔌 Price fetcher from backend API (or your own proxy endpoint)
async function fetchPrice(symbol = 'ETHUSDT') {
  try {
    const res = await fetch(`/api/price?symbol=${symbol}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('❌ Failed to fetch price:', err);
    return null;
  }
}

// 🎯 Strategy Logic
function analyzeMarket({ price, trend, volume, candle }) {
  if (!price) return 'HOLD';
  if (price < 2500) return 'BUY';
  if (price > 3500) return 'SELL';
  return 'HOLD';
}

function shouldBuy(price) {
  return price < 2500;
}

function shouldSell(price) {
  return price > 3500;
}

// 🧠 Main Brain Function
async function runBrainCheck(symbol = 'ETHUSDT') {
  console.log('[🧠 BRAIN] ⏳ Running strategy check...');
  const data = await fetchPrice(symbol);

  if (!data || !data.price) {
    console.log('[❌ ERROR] Price fetch failed.');
    return 'HOLD';
  }

  const decision = analyzeMarket(data);

  if (shouldBuy(data.price)) {
    console.log(`[🟢 BUY] Signal at ${data.price}`);
    return 'BUY';
  }

  if (shouldSell(data.price)) {
    console.log(`[🔴 SELL] Signal at ${data.price}`);
    return 'SELL';
  }

  console.log(`[🟡 HOLD] No signal at ${data.price}`);
  return 'HOLD';
}

// 🧨 Manual Triggers
async function manualTriggerBuy() {
  console.log('🟢 [MANUAL] Forced BUY triggered.');
  return 'BUY';
}

async function manualTriggerSell() {
  console.log('🔴 [MANUAL] Forced SELL triggered.');
  return 'SELL';
}

// 🔄 Export as browser global (for console access)
window.CROAK_BRAIN = {
  runBrainCheck,
  manualTriggerBuy,
  manualTriggerSell,
};
