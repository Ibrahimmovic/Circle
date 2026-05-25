import { Router } from 'express';
import { getWalletStatus, getCircleWallets } from '../services/circleWallet.js';

export const walletRoutes = Router();

walletRoutes.get('/status', async (req, res) => {
  try {
    const status = await getWalletStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

walletRoutes.get('/list', async (req, res) => {
  try {
    const wallets = await getCircleWallets();
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
