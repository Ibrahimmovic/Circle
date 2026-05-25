import { Router } from 'express';
import { detectRegime, getMarketIndicators, getPriceData } from '../services/marketData.js';

export const marketRoutes = Router();

marketRoutes.get('/regime', async (req, res) => {
  try {
    const indicators = await getMarketIndicators();
    const regime = detectRegime(indicators);
    res.json({ regime, indicators, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

marketRoutes.get('/prices', async (req, res) => {
  try {
    const prices = await getPriceData();
    res.json({ prices, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

marketRoutes.get('/indicators', async (req, res) => {
  try {
    const indicators = await getMarketIndicators();
    res.json(indicators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
