import { getMarketIndicators } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  try {
    const indicators = await getMarketIndicators();
    res.json(indicators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
