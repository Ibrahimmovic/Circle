import { getPortfolioHistory } from '../../server/services/portfolioData.js';

export default async function handler(req, res) {
  try {
    const { address, chain } = req.query;
    const wallet = address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const history = await getPortfolioHistory(wallet, chain || 'ethereum');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
