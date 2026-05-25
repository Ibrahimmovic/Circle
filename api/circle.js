const CIRCLE_CAPABILITIES = [
  'Wallets',
  'CCTP',
  'Nanopayments',
  'USDC settlement'
];

function getCircleBaseUrl(environment) {
  if (process.env.CIRCLE_BASE_URL) return process.env.CIRCLE_BASE_URL;
  return environment === 'production'
    ? 'https://api.circle.com'
    : 'https://api-sandbox.circle.com';
}

function maskIdentifier(value) {
  if (!value) return null;
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
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

  const apiKey = process.env.CIRCLE_API_KEY || process.env.CIRCLE_API_KEY_SANDBOX;
  const environment = process.env.CIRCLE_ENV === 'production' ? 'production' : 'sandbox';
  const baseUrl = getCircleBaseUrl(environment);

  if (!apiKey) {
    res.status(200).json({
      configured: false,
      connected: false,
      environment,
      status: 'missing_key',
      capabilities: CIRCLE_CAPABILITIES,
      message: 'Set CIRCLE_API_KEY in the deployment environment to enable Circle-backed settlement verification.'
    });
    return;
  }

  try {
    const upstream = await fetch(`${baseUrl}/v1/configuration`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${apiKey}`
      }
    });
    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      res.status(200).json({
        configured: true,
        connected: false,
        environment,
        status: 'circle_configuration_failed',
        httpStatus: upstream.status,
        capabilities: CIRCLE_CAPABILITIES,
        message: data?.message || `Circle configuration check returned HTTP ${upstream.status}.`
      });
      return;
    }

    const masterWalletId = data?.data?.payments?.masterWalletId;
    res.status(200).json({
      configured: true,
      connected: true,
      environment,
      status: 'connected',
      masterWalletId: maskIdentifier(masterWalletId),
      capabilities: CIRCLE_CAPABILITIES,
      message: 'Circle API key verified through /v1/configuration.'
    });
  } catch (error) {
    res.status(200).json({
      configured: true,
      connected: false,
      environment,
      status: 'circle_unreachable',
      capabilities: CIRCLE_CAPABILITIES,
      message: error.message || 'Unable to reach Circle configuration API.'
    });
  }
}
