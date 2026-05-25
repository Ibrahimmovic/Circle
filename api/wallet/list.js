import { getCircleWallets } from '../../server/services/circleWallet.js';

export default async function handler(req, res) {
  try {
    const wallets = await getCircleWallets();
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
