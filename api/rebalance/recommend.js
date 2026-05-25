import { generateRebalanceRecommendation } from '../../server/services/rebalanceEngine.js';

export default async function handler(req, res) {
  try {
    const { address, chain, riskTolerance } = req.query;
    const wallet = address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const recommendation = await generateRebalanceRecommendation(
      wallet,
      chain || 'ethereum',
      riskTolerance || 'moderate'
    );
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
