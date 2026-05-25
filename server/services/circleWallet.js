const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';
const CIRCLE_BASE_URL = 'https://api.circle.com';

async function circleRequest(path, options = {}) {
  const url = `${CIRCLE_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      ...options.headers
    }
  });
  return res.json();
}

export async function getWalletStatus() {
  if (!CIRCLE_API_KEY) {
    return {
      connected: false,
      message: 'Circle API key not configured',
      features: [
        'Developer-Controlled Wallets',
        'Automated key management',
        'Multi-chain support (EVM + Solana)',
        'Smart Contract interactions',
        'Transaction signing'
      ]
    };
  }

  try {
    const data = await circleRequest('/v1/w3s/config/entity');
    return {
      connected: true,
      entity: data.data,
      features: ['Wallet creation', 'Token transfers', 'Contract execution', 'CCTP bridging']
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      message: 'Failed to connect to Circle Wallets API'
    };
  }
}

export async function getCircleWallets() {
  if (!CIRCLE_API_KEY) {
    return {
      wallets: [],
      message: 'Configure CIRCLE_API_KEY and entity secret for wallet management',
      documentation: 'https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet'
    };
  }

  try {
    const data = await circleRequest('/v1/w3s/wallets');
    return {
      wallets: data.data?.wallets || [],
      count: data.data?.wallets?.length || 0
    };
  } catch (err) {
    return { wallets: [], error: err.message };
  }
}
