import { Router } from 'express';
import { generateRebalanceRecommendation } from '../services/rebalanceEngine.js';

export const rebalanceRoutes = Router();

rebalanceRoutes.get('/recommend', async (req, res) => {
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
});

rebalanceRoutes.post('/execute', async (req, res) => {
  try {
    const { trades } = req.body;
    res.json({
      status: 'queued',
      message: 'Rebalance trades queued for execution via Circle Wallets',
      trades,
      executionId: crypto.randomUUID()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
