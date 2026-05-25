import { getCrossChainRoutes } from '../../server/services/crossChainEngine.js';

export default function handler(req, res) {
  try {
    const routes = getCrossChainRoutes();
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
