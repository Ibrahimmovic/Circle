import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { marketRoutes } from './routes/market.js';
import { portfolioRoutes } from './routes/portfolio.js';
import { rebalanceRoutes } from './routes/rebalance.js';
import { crossChainRoutes } from './routes/crosschain.js';
import { walletRoutes } from './routes/wallet.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/rebalance', rebalanceRoutes);
app.use('/api/crosschain', crossChainRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Agora Portfolio Agent server running on port ${PORT}`);
  console.log(`   Market API:     http://localhost:${PORT}/api/market/regime`);
  console.log(`   Portfolio API:   http://localhost:${PORT}/api/portfolio/holdings`);
  console.log(`   Rebalance API:   http://localhost:${PORT}/api/rebalance/recommend`);
  console.log(`   Cross-Chain API: http://localhost:${PORT}/api/crosschain/routes`);
});
