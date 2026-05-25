import { getMarketIndicators, detectRegime } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  try {
    const indicators = await getMarketIndicators();
    const regime = detectRegime(indicators);
    res.json({ regime, indicators, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
