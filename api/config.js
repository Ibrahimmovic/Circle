export default function handler(req, res) {
  const circleEnvironment = process.env.CIRCLE_ENV === 'production' ? 'production' : 'sandbox';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    circle: {
      configured: Boolean(process.env.CIRCLE_API_KEY || process.env.CIRCLE_API_KEY_SANDBOX),
      environment: circleEnvironment
    },
    marketData: {
      coingecko: 'public'
    }
  });
}
