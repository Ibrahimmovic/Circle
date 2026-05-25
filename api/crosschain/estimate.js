import { estimateBridgeFee } from '../../server/services/crossChainEngine.js';

export default async function handler(req, res) {
  try {
    const { from, to, amount } = req.query;
    const estimate = await estimateBridgeFee(from, to, amount);
    res.json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
