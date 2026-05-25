export default function handler(req, res) {
  const circleEnvironment = process.env.CIRCLE_ENV === 'production' ? 'production' : 'sandbox';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    circle: {
      configured: Boolean(process.env.CIRCLE_API_KEY || process.env.CIRCLE_API_KEY_SANDBOX),
      kitConfigured: Boolean(process.env.CIRCLE_KIT_KEY || process.env.CIRCLE_APP_KIT_KEY),
      environment: circleEnvironment
    },
    marketData: {
      coingecko: 'public',
      defiLlama: 'public',
      fearGreed: 'public',
      goldrush: Boolean(process.env.GOLDRUSH_API_KEY || process.env.COVALENT_API_KEY || process.env.COVALENT_KEY),
      zerion: Boolean(process.env.ZERION_API_KEY || process.env.ZERION_KEY)
    },
    arc: {
      settlement: 'USDC-native',
      finality: 'sub-second deterministic',
      feeModel: '~$0.01 USDC transaction fees'
    }
  });
}
