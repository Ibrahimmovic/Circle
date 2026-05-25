import { getPriceData } from '../../server/services/marketData.js';

export default async function handler(req, res) {
  try {
    const prices = await getPriceData();
    res.json({ prices, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
