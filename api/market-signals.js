const COINGECKO_IDS = ['bitcoin', 'ethereum', 'solana', 'chainlink'];

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function buildFallbackSignals(reason) {
  return {
    mode: 'fallback',
    reason,
    prices: [
      { symbol: 'BTC', price: 68200, change24h: 2.6 },
      { symbol: 'ETH', price: 3740, change24h: 4.1 },
      { symbol: 'SOL', price: 164, change24h: 7.4 },
      { symbol: 'LINK', price: 17.8, change24h: 1.2 }
    ],
    fearGreed: { value: 64, classification: 'Greed' },
    yields: [
      { protocol: 'aave-v3', chain: 'Ethereum', symbol: 'USDC', apy: 4.12, tvlUsd: 210000000 },
      { protocol: 'compound-v3', chain: 'Base', symbol: 'USDC', apy: 3.86, tvlUsd: 76000000 },
      { protocol: 'morpho-blue', chain: 'Ethereum', symbol: 'USDC', apy: 5.03, tvlUsd: 92000000 }
    ]
  };
}

function normalizePrices(data) {
  const mapping = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    solana: 'SOL',
    chainlink: 'LINK'
  };

  return COINGECKO_IDS.map((id) => ({
    symbol: mapping[id],
    price: Number(data?.[id]?.usd || 0),
    change24h: Number(data?.[id]?.usd_24h_change || 0)
  })).filter((item) => item.price > 0);
}

function normalizeYields(data) {
  return (data?.data || [])
    .filter((pool) => {
      const symbol = String(pool.symbol || '').toUpperCase();
      return symbol.includes('USDC') && Number(pool.tvlUsd || 0) > 1000000 && Number(pool.apy || 0) < 40;
    })
    .sort((a, b) => Number(b.apy || 0) - Number(a.apy || 0))
    .slice(0, 5)
    .map((pool) => ({
      protocol: pool.project,
      chain: pool.chain,
      symbol: pool.symbol,
      apy: Number(pool.apy || 0),
      tvlUsd: Number(pool.tvlUsd || 0)
    }));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const [prices, fearGreed, yields] = await Promise.allSettled([
      fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS.join(',')}&vs_currencies=usd&include_24hr_change=true`),
      fetchJson('https://api.alternative.me/fng/'),
      fetchJson('https://yields.llama.fi/pools')
    ]);

    const fallback = buildFallbackSignals();
    res.status(200).json({
      mode: 'live',
      prices: prices.status === 'fulfilled' ? normalizePrices(prices.value) : fallback.prices,
      fearGreed: fearGreed.status === 'fulfilled'
        ? {
            value: Number(fearGreed.value?.data?.[0]?.value || fallback.fearGreed.value),
            classification: fearGreed.value?.data?.[0]?.value_classification || fallback.fearGreed.classification
          }
        : fallback.fearGreed,
      yields: yields.status === 'fulfilled' ? normalizeYields(yields.value) : fallback.yields,
      sources: {
        prices: prices.status === 'fulfilled' ? 'CoinGecko' : 'fallback',
        sentiment: fearGreed.status === 'fulfilled' ? 'Alternative.me' : 'fallback',
        yields: yields.status === 'fulfilled' ? 'DefiLlama' : 'fallback'
      }
    });
  } catch (error) {
    res.status(200).json(buildFallbackSignals(error.message || 'market signal fetch failed'));
  }
}
