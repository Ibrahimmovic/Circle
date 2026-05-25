import { getWalletStatus } from '../../server/services/circleWallet.js';

export default async function handler(req, res) {
  try {
    const status = await getWalletStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
