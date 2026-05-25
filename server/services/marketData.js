const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_URL = 'https://api.alternative.me/fng/';
const DEFI_LLAMA_URL = 'https://yields.llama.fi/pools';

const TRACKED_ASSETS = [
  'bitcoin', 'ethereum', 'solana', 'matic-network',
  'avalanche-2', 'chainlink', 'usd-coin', 'tether'
];

export async function getPriceData() {
  try {
    const ids = TRACKED_ASSETS.join(',');
    const res = await fetch(
      `${COINGECKO_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true&include_market_cap=true`
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const data = await res.json();

    const nameMap = {
      bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL',
      'matic-network': 'MATIC', 'avalanche-2': 'AVAX',
      chainlink: 'LINK', 'usd-coin': 'USDC', tether: 'USDT'
    };

    return Object.entries(data).map(([id, info]) => ({
      id,
      symbol: nameMap[id] || id.toUpperCase(),
      price: info.usd,
      change24h: info.usd_24h_change || 0,
      change7d: info.usd_7d_change || 0,
      marketCap: info.usd_market_cap || 0
    }));
  } catch (err) {
    console.error('Price fetch error:', err.message);
    return getFallbackPrices();
  }
}

function getFallbackPrices() {
  return [
    { id: 'bitcoin', symbol: 'BTC', price: 67500, change24h: 1.2, change7d: 3.5, marketCap: 1320000000000 },
    { id: 'ethereum', symbol: 'ETH', price: 3450, change24h: 0.8, change7d: 2.1, marketCap: 415000000000 },
    { id: 'solana', symbol: 'SOL', price: 145, change24h: -0.5, change7d: 5.2, marketCap: 65000000000 },
    { id: 'matic-network', symbol: 'MATIC', price: 0.72, change24h: -1.1, change7d: -2.3, marketCap: 7200000000 },
    { id: 'avalanche-2', symbol: 'AVAX', price: 35.8, change24h: 2.3, change7d: 4.1, marketCap: 13500000000 },
    { id: 'chainlink', symbol: 'LINK', price: 14.5, change24h: 0.3, change7d: 1.8, marketCap: 8700000000 },
    { id: 'usd-coin', symbol: 'USDC', price: 1.0, change24h: 0.0, change7d: 0.0, marketCap: 33000000000 },
    { id: 'tether', symbol: 'USDT', price: 1.0, change24h: 0.0, change7d: 0.0, marketCap: 112000000000 }
  ];
}

export async function getMarketIndicators() {
  const [fearGreed, prices, yields] = await Promise.all([
    fetchFearGreed(),
    getPriceData(),
    fetchTopYields()
  ]);

  const avgChange24h = prices.reduce((sum, p) => sum + (p.change24h || 0), 0) / prices.length;
  const avgChange7d = prices.reduce((sum, p) => sum + (p.change7d || 0), 0) / prices.length;

  const volatility = Math.abs(avgChange24h) > 5 ? 'HIGH' :
                     Math.abs(avgChange24h) > 2 ? 'MODERATE' : 'LOW';

  const momentum = avgChange7d > 3 ? 'BULLISH' :
                   avgChange7d < -3 ? 'BEARISH' : 'NEUTRAL';

  return {
    fearGreedIndex: fearGreed.value,
    fearGreedLabel: fearGreed.classification,
    avgChange24h: parseFloat(avgChange24h.toFixed(2)),
    avgChange7d: parseFloat(avgChange7d.toFixed(2)),
    volatility,
    momentum,
    topYields: yields,
    totalMarketCap: prices.reduce((sum, p) => sum + (p.marketCap || 0), 0)
  };
}

async function fetchFearGreed() {
  try {
    const res = await fetch(FEAR_GREED_URL);
    const data = await res.json();
    if (data.data && data.data[0]) {
      return { value: parseInt(data.data[0].value), classification: data.data[0].value_classification };
    }
  } catch (err) {
    console.error('Fear&Greed fetch error:', err.message);
  }
  return { value: 50, classification: 'Neutral' };
}

async function fetchTopYields() {
  try {
    const res = await fetch(DEFI_LLAMA_URL);
    const data = await res.json();
    return data.data
      .filter(p => p.tvlUsd > 1000000 && p.apy < 50 && p.apy > 0)
      .sort((a, b) => b.apy - a.apy)
      .slice(0, 5)
      .map(p => ({ protocol: p.project, pool: p.symbol, apy: p.apy, chain: p.chain, tvl: p.tvlUsd }));
  } catch (err) {
    console.error('Yields fetch error:', err.message);
    return [];
  }
}

export function detectRegime(indicators) {
  const { fearGreedIndex, volatility, momentum, avgChange7d } = indicators;

  let score = 0;
  let signals = [];

  if (fearGreedIndex >= 75) { score += 2; signals.push('Extreme Greed (F&G)'); }
  else if (fearGreedIndex >= 55) { score += 1; signals.push('Greed (F&G)'); }
  else if (fearGreedIndex <= 25) { score -= 2; signals.push('Extreme Fear (F&G)'); }
  else if (fearGreedIndex <= 45) { score -= 1; signals.push('Fear (F&G)'); }

  if (momentum === 'BULLISH') { score += 1; signals.push('Bullish 7d momentum'); }
  else if (momentum === 'BEARISH') { score -= 1; signals.push('Bearish 7d momentum'); }

  if (volatility === 'HIGH') { signals.push('High volatility detected'); }

  if (avgChange7d > 5) { score += 1; signals.push('Strong uptrend'); }
  else if (avgChange7d < -5) { score -= 1; signals.push('Strong downtrend'); }

  let regime, description, riskLevel, color;

  if (score >= 3) {
    regime = 'EUPHORIA';
    description = 'Market is overheated. Consider taking profits and increasing stablecoin allocation.';
    riskLevel = 'HIGH';
    color = '#f59e0b';
  } else if (score >= 1) {
    regime = 'BULL';
    description = 'Bullish conditions. Favor growth assets, maintain moderate risk exposure.';
    riskLevel = 'MODERATE';
    color = '#10b981';
  } else if (score <= -3) {
    regime = 'CRISIS';
    description = 'Market in crisis. Maximize stablecoin allocation, seek yield in DeFi.';
    riskLevel = 'EXTREME';
    color = '#ef4444';
  } else if (score <= -1) {
    regime = 'BEAR';
    description = 'Bearish conditions. Increase defensive positions and stablecoin holdings.';
    riskLevel = 'HIGH';
    color = '#f97316';
  } else {
    regime = 'NEUTRAL';
    description = 'Markets consolidating. Maintain balanced allocation across asset classes.';
    riskLevel = 'LOW';
    color = '#6366f1';
  }

  return { regime, description, riskLevel, color, score, signals };
}
