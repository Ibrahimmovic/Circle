import { executeBridge } from '../../server/services/crossChainEngine.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { fromChain, toChain, amount, token } = req.body;
    const result = await executeBridge(fromChain, toChain, amount, token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
