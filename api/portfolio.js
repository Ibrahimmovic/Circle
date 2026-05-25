const CHAIN_IDS = {
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  polygon: 137,
  optimism: 10,
  bsc: 56
};

const DEMO_PORTFOLIO = [
  { symbol: 'BTC', name: 'Bitcoin', value: 33392, balance: 0.4896, price: 68200, source: 'demo' },
  { symbol: 'ETH', name: 'Ethereum', value: 38529, balance: 10.302, price: 3740, source: 'demo' },
  { symbol: 'SOL', name: 'Solana', value: 17980, balance: 109.634, price: 164, source: 'demo' },
  { symbol: 'LINK', name: 'Chainlink', value: 7706, balance: 432.92, price: 17.8, source: 'demo' },
  { symbol: 'USDC', name: 'Circle USDC', value: 30823, balance: 30823, price: 1, source: 'demo' }
];

function getApiKeys() {
  return {
    goldrush: process.env.GOLDRUSH_API_KEY || process.env.COVALENT_API_KEY || process.env.COVALENT_KEY || '',
    zerion: process.env.ZERION_API_KEY || process.env.ZERION_KEY || ''
  };
}

function sendJson(res, statusCode, body) {
  res.status(statusCode).json(body);
}

function normalizeAddress(address) {
  return String(address || '').trim();
}

function isEvmAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function getChainId(chain) {
  return CHAIN_IDS[String(chain || 'ethereum').toLowerCase()] || CHAIN_IDS.ethereum;
}

function tokenValue(token) {
  const value = Number(token.value || 0);
  return Number.isFinite(value) ? value : 0;
}

function mergeTokens(...tokenGroups) {
  const merged = new Map();

  tokenGroups.flat().forEach((token) => {
    if (!token || !token.symbol) return;
    const symbol = String(token.symbol).toUpperCase();
    const current = merged.get(symbol) || {
      symbol,
      name: token.name || symbol,
      value: 0,
      balance: 0,
      price: token.price || 0,
      sources: []
    };

    current.value += tokenValue(token);
    current.balance += Number(token.balance || 0);
    current.price = token.price || current.price;
    if (token.source && !current.sources.includes(token.source)) current.sources.push(token.source);
    merged.set(symbol, current);
  });

  return [...merged.values()]
    .filter((token) => token.value > 0.01)
    .sort((a, b) => b.value - a.value)
    .slice(0, 20);
}

async function fetchGoldRushPortfolio(address, chain, apiKey) {
  if (!apiKey) return { configured: false, tokens: [], error: 'missing_key' };

  const chainId = getChainId(chain);
  const url = new URL(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`);
  url.searchParams.set('quote-currency', 'USD');
  url.searchParams.set('format', 'JSON');
  url.searchParams.set('nft', 'false');
  url.searchParams.set('no-nft-fetch', 'true');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    return { configured: true, tokens: [], error: data.error_message || `HTTP ${response.status}` };
  }

  const tokens = (data?.data?.items || []).map((item) => {
    const decimals = Number(item.contract_decimals || 0);
    const rawBalance = Number(item.balance || 0);
    const balance = decimals ? rawBalance / (10 ** decimals) : rawBalance;

    return {
      symbol: item.contract_ticker_symbol,
      name: item.contract_name,
      balance,
      value: Number(item.quote || 0),
      price: Number(item.quote_rate || 0),
      source: 'GoldRush'
    };
  });

  return { configured: true, tokens };
}

async function fetchZerionPortfolio(address, chain, apiKey) {
  if (!apiKey) return { configured: false, tokens: [], error: 'missing_key' };

  const chainParam = String(chain || 'ethereum').toLowerCase() === 'ethereum'
    ? 'eth'
    : String(chain || 'ethereum').toLowerCase();
  const url = new URL(`https://api.zerion.io/v1/wallets/${address}/positions/`);
  url.searchParams.set('currency', 'usd');
  url.searchParams.set('filter[chain_ids]', chainParam);
  url.searchParams.set('filter[positions]', 'only_simple');

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { configured: true, tokens: [], error: data?.errors?.[0]?.detail || `HTTP ${response.status}` };
  }

  const tokens = (data?.data || []).map((position) => {
    const attributes = position.attributes || {};
    const fungible = attributes.fungible_info || {};

    return {
      symbol: fungible.symbol,
      name: fungible.name,
      balance: Number(attributes.quantity?.float || attributes.quantity?.numeric || 0),
      value: Number(attributes.value || 0),
      price: Number(attributes.price || 0),
      source: 'Zerion'
    };
  });

  return { configured: true, tokens };
}

function buildDemoResponse(address, chain, keys, message) {
  const totalValue = DEMO_PORTFOLIO.reduce((sum, token) => sum + token.value, 0);
  return {
    address,
    chain,
    mode: 'demo',
    totalValue,
    tokens: DEMO_PORTFOLIO,
    dataSources: {
      goldrush: { configured: Boolean(keys.goldrush), status: keys.goldrush ? 'ready' : 'missing_key' },
      zerion: { configured: Boolean(keys.zerion), status: keys.zerion ? 'ready' : 'missing_key' }
    },
    message
  };
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
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const keys = getApiKeys();
  const address = normalizeAddress(req.query.address);
  const chain = String(req.query.chain || 'ethereum').toLowerCase();

  if (!address || !isEvmAddress(address)) {
    sendJson(res, 200, buildDemoResponse(address, chain, keys, 'Enter an EVM wallet address to load live Zerion and GoldRush portfolio data.'));
    return;
  }

  try {
    const [goldrush, zerion] = await Promise.all([
      fetchGoldRushPortfolio(address, chain, keys.goldrush).catch((error) => ({ configured: Boolean(keys.goldrush), tokens: [], error: error.message })),
      fetchZerionPortfolio(address, chain, keys.zerion).catch((error) => ({ configured: Boolean(keys.zerion), tokens: [], error: error.message }))
    ]);
    const tokens = mergeTokens(goldrush.tokens, zerion.tokens);

    if (!tokens.length) {
      sendJson(res, 200, buildDemoResponse(address, chain, keys, 'Live sources returned no token balances; showing hackathon demo portfolio.'));
      return;
    }

    const totalValue = tokens.reduce((sum, token) => sum + token.value, 0);
    sendJson(res, 200, {
      address,
      chain,
      mode: 'live',
      totalValue,
      tokens,
      dataSources: {
        goldrush: { configured: goldrush.configured, status: goldrush.error ? goldrush.error : 'ok' },
        zerion: { configured: zerion.configured, status: zerion.error ? zerion.error : 'ok' }
      },
      message: 'Portfolio aggregated from server-side Zerion and GoldRush integrations.'
    });
  } catch (error) {
    sendJson(res, 200, buildDemoResponse(address, chain, keys, error.message || 'Portfolio aggregation failed; using demo portfolio.'));
  }
}
