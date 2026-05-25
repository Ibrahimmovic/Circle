const KIT_KEY = process.env.KIT_KEY || '';
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || '';

const SUPPORTED_CHAINS = [
  { id: 'ethereum', name: 'Ethereum', chainId: 1, cctpDomain: 0 },
  { id: 'avalanche', name: 'Avalanche', chainId: 43114, cctpDomain: 1 },
  { id: 'arbitrum', name: 'Arbitrum', chainId: 42161, cctpDomain: 3 },
  { id: 'base', name: 'Base', chainId: 8453, cctpDomain: 6 },
  { id: 'polygon', name: 'Polygon', chainId: 137, cctpDomain: 7 },
  { id: 'solana', name: 'Solana', chainId: 0, cctpDomain: 5 },
  { id: 'arc_testnet', name: 'Arc Testnet', chainId: 0, cctpDomain: 12 }
];

const FEE_TABLE = {
  'ethereum->base': { fee: 0.10, time: '~15s', protocol: 'CCTP V2 Fast' },
  'ethereum->arbitrum': { fee: 0.12, time: '~20s', protocol: 'CCTP V2 Fast' },
  'ethereum->polygon': { fee: 0.15, time: '~25s', protocol: 'CCTP V2 Fast' },
  'ethereum->avalanche': { fee: 0.12, time: '~20s', protocol: 'CCTP V2 Fast' },
  'base->ethereum': { fee: 0.08, time: '~15s', protocol: 'CCTP V2 Fast' },
  'base->arbitrum': { fee: 0.06, time: '~10s', protocol: 'CCTP V2 Fast' },
  'arbitrum->base': { fee: 0.06, time: '~10s', protocol: 'CCTP V2 Fast' },
  'arbitrum->ethereum': { fee: 0.10, time: '~20s', protocol: 'CCTP V2 Fast' },
  'polygon->ethereum': { fee: 0.12, time: '~25s', protocol: 'CCTP V2 Fast' },
  'avalanche->ethereum': { fee: 0.10, time: '~20s', protocol: 'CCTP V2 Fast' },
  'arc_testnet->ethereum': { fee: 0.01, time: '~5s', protocol: 'Arc Gateway' },
  'ethereum->arc_testnet': { fee: 0.01, time: '~5s', protocol: 'Arc Gateway' }
};

export function getCrossChainRoutes() {
  return {
    chains: SUPPORTED_CHAINS,
    supportedTokens: ['USDC', 'EURC'],
    protocol: 'Circle CCTP V2 + Arc Gateway',
    features: [
      'Sub-second finality on Arc',
      'Native USDC burn & mint (no wrapped tokens)',
      'Fast Transfer mode (~15s cross-chain)',
      '~$0.01 fees on Arc',
      'Nanopayments support (min $0.000001)'
    ]
  };
}

export async function estimateBridgeFee(fromChain, toChain, amount) {
  const route = `${fromChain}->${toChain}`;
  const feeInfo = FEE_TABLE[route];

  if (!feeInfo) {
    return {
      supported: false,
      error: `Route ${fromChain} → ${toChain} not supported`
    };
  }

  const amountNum = parseFloat(amount) || 10;
  const fee = feeInfo.fee;
  const receiveAmount = amountNum - fee;

  return {
    supported: true,
    fromChain,
    toChain,
    sendAmount: amountNum,
    fee,
    receiveAmount: parseFloat(receiveAmount.toFixed(6)),
    estimatedTime: feeInfo.time,
    protocol: feeInfo.protocol,
    feePercentage: ((fee / amountNum) * 100).toFixed(3) + '%'
  };
}

export async function executeBridge(fromChain, toChain, amount, token = 'USDC') {
  const estimate = await estimateBridgeFee(fromChain, toChain, amount);

  if (!estimate.supported) {
    return { success: false, error: estimate.error };
  }

  const executionId = crypto.randomUUID();

  return {
    success: true,
    executionId,
    status: 'INITIATED',
    details: {
      fromChain,
      toChain,
      token,
      sendAmount: parseFloat(amount),
      estimatedReceive: estimate.receiveAmount,
      fee: estimate.fee,
      protocol: estimate.protocol,
      estimatedTime: estimate.estimatedTime
    },
    circleIntegration: {
      method: 'AppKit.bridge()',
      sdk: '@circle-fin/app-kit',
      cctpVersion: 'V2',
      note: 'Production execution requires PRIVATE_KEY for transaction signing'
    },
    steps: [
      { step: 1, action: 'Approve USDC spend', status: 'pending' },
      { step: 2, action: `Burn ${amount} ${token} on ${fromChain}`, status: 'pending' },
      { step: 3, action: 'Wait for attestation', status: 'pending' },
      { step: 4, action: `Mint ${estimate.receiveAmount} ${token} on ${toChain}`, status: 'pending' }
    ],
    timestamp: new Date().toISOString()
  };
}
