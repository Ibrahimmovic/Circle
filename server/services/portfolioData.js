const GOLDRUSH_KEY = process.env.GOLDRUSH_KEY || '';
const ZERION_KEY = process.env.ZERION_KEY || '';

const CHAIN_IDS = { ethereum: 1, bsc: 56, polygon: 137, arbitrum: 42161, base: 8453, avalanche: 43114 };

export async function getPortfolioHoldings(address, chain) {
  const holdings = await fetchFromGoldRush(address, chain);

  if (holdings && holdings.length > 0) {
    const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);
    return {
      address,
      chain,
      totalValue,
      holdings: holdings.map(h => ({
        ...h,
        allocation: totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : 0
      })),
      source: 'goldrush',
      timestamp: new Date().toISOString()
    };
  }

  const zerionHoldings = await fetchFromZerion(address, chain);
  if (zerionHoldings && zerionHoldings.length > 0) {
    const totalValue = zerionHoldings.reduce((sum, h) => sum + (h.value || 0), 0);
    return {
      address,
      chain,
      totalValue,
      holdings: zerionHoldings.map(h => ({
        ...h,
        allocation: totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : 0
      })),
      source: 'zerion',
      timestamp: new Date().toISOString()
    };
  }

  return getDemoPortfolio(address, chain);
}

async function fetchFromGoldRush(address, chain) {
  if (!GOLDRUSH_KEY) return null;
  const chainId = CHAIN_IDS[chain] || 1;
  try {
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${GOLDRUSH_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data || !data.data.items) return null;

    return data.data.items
      .filter(i => parseFloat(i.balance) > 0 && i.quote > 0.01)
      .map(i => ({
        symbol: i.contract_ticker_symbol || 'UNKNOWN',
        name: i.contract_name || 'Unknown Token',
        balance: (i.balance / Math.pow(10, i.contract_decimals)).toFixed(6),
        value: i.quote || 0,
        price: i.quote_rate || 0,
        change24h: i.quote_24h ? ((i.quote - i.quote_24h) / i.quote_24h * 100) : 0,
        contractAddress: i.contract_address,
        logo: i.logo_url
      }))
      .sort((a, b) => b.value - a.value);
  } catch (err) {
    console.error('GoldRush fetch error:', err.message);
    return null;
  }
}

async function fetchFromZerion(address, chain) {
  if (!ZERION_KEY) return null;
  try {
    const chainParam = chain === 'ethereum' ? 'ethereum' : chain;
    const url = `https://api.zerion.io/v1/wallets/${address}/positions/?currency=usd&filter[chain_ids]=${chainParam}`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Basic ${Buffer.from(ZERION_KEY + ':').toString('base64')}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data) return null;

    return data.data
      .filter(pos => pos.attributes?.value > 0.01)
      .map(pos => ({
        symbol: pos.attributes?.fungible_info?.symbol || 'UNKNOWN',
        name: pos.attributes?.fungible_info?.name || 'Unknown',
        balance: pos.attributes?.quantity?.float || 0,
        value: pos.attributes?.value || 0,
        price: pos.attributes?.price || 0,
        change24h: pos.attributes?.changes?.percent_1d || 0,
        contractAddress: pos.attributes?.fungible_info?.implementations?.[0]?.address || '',
        logo: pos.attributes?.fungible_info?.icon?.url || ''
      }))
      .sort((a, b) => b.value - a.value);
  } catch (err) {
    console.error('Zerion fetch error:', err.message);
    return null;
  }
}

function getDemoPortfolio(address, chain) {
  const demoHoldings = [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.45', value: 8452.50, price: 3450, change24h: 0.8, contractAddress: '0x0000000000000000000000000000000000000000', logo: '' },
    { symbol: 'USDC', name: 'USD Coin', balance: '5000.00', value: 5000, price: 1.0, change24h: 0.0, contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', logo: '' },
    { symbol: 'LINK', name: 'Chainlink', balance: '150.00', value: 2175, price: 14.5, change24h: 0.3, contractAddress: '0x514910771af9ca656af840dff83e8264ecf986ca', logo: '' },
    { symbol: 'SOL', name: 'Solana', balance: '12.50', value: 1812.50, price: 145, change24h: -0.5, contractAddress: '', logo: '' },
    { symbol: 'AVAX', name: 'Avalanche', balance: '25.00', value: 895, price: 35.8, change24h: 2.3, contractAddress: '', logo: '' },
    { symbol: 'USDT', name: 'Tether', balance: '2000.00', value: 2000, price: 1.0, change24h: 0.0, contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', logo: '' }
  ];

  const totalValue = demoHoldings.reduce((sum, h) => sum + h.value, 0);
  return {
    address,
    chain,
    totalValue,
    holdings: demoHoldings.map(h => ({
      ...h,
      allocation: ((h.value / totalValue) * 100).toFixed(1)
    })),
    source: 'demo',
    timestamp: new Date().toISOString()
  };
}

export async function getPortfolioHistory(address, chain) {
  if (!GOLDRUSH_KEY) return getDemoHistory();
  const chainId = CHAIN_IDS[chain] || 1;
  try {
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${GOLDRUSH_KEY}&page-size=20`;
    const res = await fetch(url);
    if (!res.ok) return getDemoHistory();
    const data = await res.json();
    if (!data.data || !data.data.items) return getDemoHistory();

    return data.data.items.slice(0, 15).map(tx => ({
      hash: tx.tx_hash,
      timestamp: tx.block_signed_at,
      value: tx.value ? (parseFloat(tx.value) / 1e18).toFixed(4) : '0',
      gasSpent: tx.gas_spent || 0,
      successful: tx.successful
    }));
  } catch (err) {
    console.error('History fetch error:', err.message);
    return getDemoHistory();
  }
}

function getDemoHistory() {
  const now = Date.now();
  return Array.from({ length: 10 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).slice(2, 66)}`,
    timestamp: new Date(now - i * 86400000).toISOString(),
    value: (Math.random() * 2).toFixed(4),
    gasSpent: Math.floor(Math.random() * 100000),
    successful: true
  }));
}
