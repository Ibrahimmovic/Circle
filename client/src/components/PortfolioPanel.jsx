import React, { useState, useEffect } from 'react';

export default function PortfolioPanel() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

  useEffect(() => { fetchPortfolio(); }, []);

  async function fetchPortfolio() {
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio/holdings?address=${address}`);
      const data = await res.json();
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-8 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-arc-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Wallet address (0x...)"
          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-arc-500"
        />
        <button
          onClick={fetchPortfolio}
          className="bg-arc-500 hover:bg-arc-600 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          Analyze
        </button>
      </div>

      {portfolio && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Total Value</div>
              <div className="text-3xl font-bold mt-1 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                ${portfolio.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">{portfolio.holdings?.length} assets tracked</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Data Source</div>
              <div className="text-lg font-semibold mt-1 text-arc-400 capitalize">{portfolio.source}</div>
              <div className="text-xs text-gray-500 mt-1">GoldRush + Zerion fallback</div>
            </div>
            <div className="glass-card p-5">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Chain</div>
              <div className="text-lg font-semibold mt-1 text-purple-400 capitalize">{portfolio.chain}</div>
              <div className="text-xs text-gray-500 mt-1">Multi-chain via CCTP</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Holdings</h3>
            <div className="space-y-2">
              {portfolio.holdings?.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arc-400 to-indigo-600 flex items-center justify-center text-xs font-bold">
                      {h.symbol?.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{h.symbol}</div>
                      <div className="text-xs text-gray-500">{h.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">${parseFloat(h.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className="text-xs text-gray-500">{h.balance} @ ${parseFloat(h.price).toFixed(2)}</div>
                  </div>
                  <div className="text-right w-20">
                    <div className="text-xs text-gray-400">{h.allocation}%</div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-arc-500 rounded-full" style={{ width: `${Math.min(100, h.allocation)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
