import { Router } from 'express';
import { getPortfolioHoldings, getPortfolioHistory } from '../services/portfolioData.js';

export const portfolioRoutes = Router();

portfolioRoutes.get('/holdings', async (req, res) => {
  try {
    const { address, chain } = req.query;
    const wallet = address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const holdings = await getPortfolioHoldings(wallet, chain || 'ethereum');
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

portfolioRoutes.get('/history', async (req, res) => {
  try {
    const { address, chain } = req.query;
    const wallet = address || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const history = await getPortfolioHistory(wallet, chain || 'ethereum');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
