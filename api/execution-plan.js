const ARC_SETTLEMENT = {
  chain: 'Arc testnet',
  finality: 'sub-second deterministic finality',
  feeModel: '~$0.01 paid in USDC',
  role: 'stablecoin-native coordination layer for agent settlement'
};

const VENUES = [
  { name: 'Arc Gateway', chain: 'Arc', type: 'unified-balance', feeBps: 1, latencyMs: 480, depthScore: 92, circlePrimitive: 'Gateway' },
  { name: 'Circle CCTP', chain: 'USDC rails', type: 'bridge', feeBps: 2, latencyMs: 900, depthScore: 96, circlePrimitive: 'CCTP' },
  { name: 'Uniswap v3', chain: 'Ethereum', type: 'dex', feeBps: 8, latencyMs: 2100, depthScore: 94, circlePrimitive: 'Paymaster' },
  { name: 'Aerodrome', chain: 'Base', type: 'dex', feeBps: 5, latencyMs: 800, depthScore: 86, circlePrimitive: 'CCTP' },
  { name: 'Jupiter', chain: 'Solana', type: 'aggregator', feeBps: 6, latencyMs: 500, depthScore: 81, circlePrimitive: 'CCTP' },
  { name: 'CEX RFQ', chain: 'Off-chain', type: 'rfq', feeBps: 12, latencyMs: 1700, depthScore: 98, circlePrimitive: 'Wallets' }
];

function asNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function rankVenues({ source, destination, amount, settlementAsset, maxSlippageBps }) {
  return VENUES.map((venue) => {
    const sameVenueBonus = venue.chain === destination ? 18 : 0;
    const arcBonus = venue.chain === 'Arc' || source === 'Arc' || destination === 'Arc' ? 12 : 0;
    const settlementBonus = settlementAsset === 'USDC' ? 10 : 2;
    const bridgePenalty = source === destination ? 0 : 7;
    const estimatedSlippageBps = Math.max(
      3,
      Math.round((amount / 100000) * (100 - venue.depthScore) + venue.feeBps + bridgePenalty - sameVenueBonus / 4)
    );
    const score = venue.depthScore + sameVenueBonus + arcBonus + settlementBonus - estimatedSlippageBps - venue.latencyMs / 500;

    return {
      ...venue,
      source,
      destination,
      settlementAsset,
      estimatedSlippageBps,
      estimatedCostUsd: amount * (estimatedSlippageBps / 10000),
      allowed: estimatedSlippageBps <= maxSlippageBps,
      score: Math.round(score * 10) / 10
    };
  }).sort((a, b) => b.score - a.score);
}

export default function handler(req, res) {
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

  const source = String(req.query.source || 'Base');
  const destination = String(req.query.destination || 'Arc');
  const settlementAsset = String(req.query.settlementAsset || 'USDC').toUpperCase();
  const amount = asNumber(req.query.amount, 12500);
  const maxSlippageBps = asNumber(req.query.maxSlippageBps, 65);
  const rankedRoutes = rankVenues({ source, destination, amount, settlementAsset, maxSlippageBps });

  res.status(200).json({
    source,
    destination,
    amount,
    settlementAsset,
    maxSlippageBps,
    arc: ARC_SETTLEMENT,
    routes: rankedRoutes,
    recommended: rankedRoutes[0],
    executionSteps: [
      'Check unified USDC balance and wallet policy limits',
      'Move USDC collateral through Gateway or CCTP when destination liquidity is superior',
      'Execute split order on best venue under slippage and latency constraints',
      'Settle PnL and telemetry fees in USDC nanopayments on Arc'
    ]
  });
}
