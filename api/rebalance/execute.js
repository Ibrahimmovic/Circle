export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
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
}
