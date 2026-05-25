import { getPortfolioHoldings } from './portfolioData.js';
import { getMarketIndicators, detectRegime } from './marketData.js';

const TARGET_ALLOCATIONS = {
  conservative: { stablecoin: 60, bluechip: 30, altcoin: 10 },
  moderate: { stablecoin: 35, bluechip: 45, altcoin: 20 },
  aggressive: { stablecoin: 15, bluechip: 45, altcoin: 40 }
};

const REGIME_ADJUSTMENTS = {
  EUPHORIA: { stablecoin: +15, bluechip: -5, altcoin: -10 },
  BULL: { stablecoin: -5, bluechip: +5, altcoin: 0 },
  NEUTRAL: { stablecoin: 0, bluechip: 0, altcoin: 0 },
  BEAR: { stablecoin: +10, bluechip: 0, altcoin: -10 },
  CRISIS: { stablecoin: +25, bluechip: -10, altcoin: -15 }
};

const STABLECOINS = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
const BLUECHIPS = ['BTC', 'ETH', 'SOL', 'AVAX', 'LINK', 'MATIC', 'DOT', 'ADA'];

function classifyAsset(symbol) {
  if (STABLECOINS.includes(symbol.toUpperCase())) return 'stablecoin';
  if (BLUECHIPS.includes(symbol.toUpperCase())) return 'bluechip';
  return 'altcoin';
}

export async function generateRebalanceRecommendation(address, chain, riskTolerance) {
  const [portfolio, indicators] = await Promise.all([
    getPortfolioHoldings(address, chain),
    getMarketIndicators()
  ]);

  const regime = detectRegime(indicators);

  const baseAlloc = TARGET_ALLOCATIONS[riskTolerance] || TARGET_ALLOCATIONS.moderate;
  const adjustment = REGIME_ADJUSTMENTS[regime.regime] || REGIME_ADJUSTMENTS.NEUTRAL;

  const targetAlloc = {
    stablecoin: Math.max(0, Math.min(100, baseAlloc.stablecoin + adjustment.stablecoin)),
    bluechip: Math.max(0, Math.min(100, baseAlloc.bluechip + adjustment.bluechip)),
    altcoin: Math.max(0, Math.min(100, baseAlloc.altcoin + adjustment.altcoin))
  };

  const total = targetAlloc.stablecoin + targetAlloc.bluechip + targetAlloc.altcoin;
  targetAlloc.stablecoin = (targetAlloc.stablecoin / total) * 100;
  targetAlloc.bluechip = (targetAlloc.bluechip / total) * 100;
  targetAlloc.altcoin = (targetAlloc.altcoin / total) * 100;

  const currentAlloc = { stablecoin: 0, bluechip: 0, altcoin: 0 };
  for (const holding of portfolio.holdings) {
    const category = classifyAsset(holding.symbol);
    currentAlloc[category] += parseFloat(holding.allocation || 0);
  }

  const trades = [];
  const totalValue = portfolio.totalValue;

  for (const category of ['stablecoin', 'bluechip', 'altcoin']) {
    const diff = targetAlloc[category] - currentAlloc[category];
    if (Math.abs(diff) > 2) {
      const valueChange = (diff / 100) * totalValue;
      trades.push({
        category,
        action: diff > 0 ? 'BUY' : 'SELL',
        targetChange: parseFloat(diff.toFixed(1)),
        valueChange: parseFloat(valueChange.toFixed(2)),
        priority: Math.abs(diff) > 10 ? 'HIGH' : 'MEDIUM'
      });
    }
  }

  const specificTrades = generateSpecificTrades(portfolio.holdings, targetAlloc, currentAlloc, totalValue);

  return {
    regime,
    riskTolerance,
    currentAllocation: {
      stablecoin: parseFloat(currentAlloc.stablecoin.toFixed(1)),
      bluechip: parseFloat(currentAlloc.bluechip.toFixed(1)),
      altcoin: parseFloat(currentAlloc.altcoin.toFixed(1))
    },
    targetAllocation: {
      stablecoin: parseFloat(targetAlloc.stablecoin.toFixed(1)),
      bluechip: parseFloat(targetAlloc.bluechip.toFixed(1)),
      altcoin: parseFloat(targetAlloc.altcoin.toFixed(1))
    },
    trades,
    specificTrades,
    portfolio: {
      totalValue,
      holdingsCount: portfolio.holdings.length
    },
    reasoning: generateReasoning(regime, riskTolerance, trades),
    timestamp: new Date().toISOString()
  };
}

function generateSpecificTrades(holdings, targetAlloc, currentAlloc, totalValue) {
  const trades = [];

  for (const category of ['stablecoin', 'bluechip', 'altcoin']) {
    const diff = targetAlloc[category] - currentAlloc[category];
    if (diff < -5) {
      const categoryHoldings = holdings.filter(h => classifyAsset(h.symbol) === category);
      const sortedByValue = [...categoryHoldings].sort((a, b) => b.value - a.value);
      const amountToSell = Math.abs(diff / 100) * totalValue;
      let remaining = amountToSell;

      for (const holding of sortedByValue) {
        if (remaining <= 0) break;
        const sellAmount = Math.min(holding.value * 0.5, remaining);
        trades.push({
          action: 'SELL',
          symbol: holding.symbol,
          amount: parseFloat(sellAmount.toFixed(2)),
          reason: `Reduce ${category} exposure by ${Math.abs(diff).toFixed(1)}%`
        });
        remaining -= sellAmount;
      }
    } else if (diff > 5) {
      const targetAsset = category === 'stablecoin' ? 'USDC' :
                          category === 'bluechip' ? 'ETH' : 'SOL';
      trades.push({
        action: 'BUY',
        symbol: targetAsset,
        amount: parseFloat(((diff / 100) * totalValue).toFixed(2)),
        reason: `Increase ${category} allocation by ${diff.toFixed(1)}%`
      });
    }
  }

  return trades;
}

function generateReasoning(regime, riskTolerance, trades) {
  const lines = [
    `Market regime: ${regime.regime} (${regime.description})`,
    `Risk profile: ${riskTolerance}`,
    `Regime adjustment applied: ${regime.signals.join(', ')}`
  ];

  if (trades.length === 0) {
    lines.push('Portfolio is within acceptable drift thresholds. No rebalancing needed.');
  } else {
    lines.push(`${trades.length} category-level adjustments recommended.`);
    for (const t of trades) {
      lines.push(`→ ${t.action} ${t.category}: ${t.targetChange > 0 ? '+' : ''}${t.targetChange}% ($${Math.abs(t.valueChange).toFixed(0)})`);
    }
  }

  return lines;
}
