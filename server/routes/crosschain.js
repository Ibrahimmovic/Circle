import { Router } from 'express';
import { getCrossChainRoutes, estimateBridgeFee, executeBridge } from '../services/crossChainEngine.js';

export const crossChainRoutes = Router();

crossChainRoutes.get('/routes', async (req, res) => {
  try {
    const routes = getCrossChainRoutes();
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

crossChainRoutes.get('/estimate', async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    const estimate = await estimateBridgeFee(from, to, amount);
    res.json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

crossChainRoutes.post('/bridge', async (req, res) => {
  try {
    const { fromChain, toChain, amount, token } = req.body;
    const result = await executeBridge(fromChain, toChain, amount, token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
