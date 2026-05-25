import React, { useState, useEffect } from 'react';

export default function MarketIndicators() {
  const [indicators, setIndicators] = useState(null);
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchIndicators(), fetchPrices()]).finally(() => setLoading(false));
  }, []);

  async function fetchIndicators() {
    try {
      const res = await fetch('/api/market/indicators');
      const data = await res.json();
      setIndicators(data);
    } catch (err) { console.error(err); }
  }

  async function fetchPrices() {
    try {
      const res = await fetch('/api/market/prices');
      const data = await res.json();
      setPrices(data.prices);
    } catch (err) { console.error(err); }
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
      {indicators && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Fear & Greed"
            value={indicators.fearGreedIndex}
            sub={indicators.fearGreedLabel}
            color={indicators.fearGreedIndex > 60 ? 'text-green-400' : indicators.fearGreedIndex < 40 ? 'text-red-400' : 'text-yellow-400'}
          />
          <MetricCard
            label="24h Average"
            value={`${indicators.avgChange24h > 0 ? '+' : ''}${indicators.avgChange24h}%`}
            sub="Market movement"
            color={indicators.avgChange24h > 0 ? 'text-green-400' : 'text-red-400'}
          />
          <MetricCard
            label="Volatility"
            value={indicators.volatility}
            sub="Current regime"
            color={indicators.volatility === 'HIGH' ? 'text-red-400' : indicators.volatility === 'MODERATE' ? 'text-yellow-400' : 'text-green-400'}
          />
          <MetricCard
            label="Momentum"
            value={indicators.momentum}
            sub="7d trend"
            color={indicators.momentum === 'BULLISH' ? 'text-green-400' : indicators.momentum === 'BEARISH' ? 'text-red-400' : 'text-gray-400'}
          />
        </div>
      )}

      {indicators?.topYields?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Top DeFi Yields (Park Idle Capital)</h3>
          <div className="space-y-2">
            {indicators.topYields.map((y, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/30">
                <div>
                  <span className="font-medium text-sm">{y.protocol}</span>
                  <span className="text-xs text-gray-500 ml-2">{y.pool}</span>
                </div>
                <div className="text-right">
                  <span className="text-green-400 font-bold">{y.apy?.toFixed(2)}%</span>
                  <span className="text-xs text-gray-500 ml-2">TVL ${(y.tvl / 1e6).toFixed(1)}M</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {prices && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Asset Prices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {prices.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-arc-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    {p.symbol?.slice(0, 2)}
                  </div>
                  <span className="font-medium text-sm">{p.symbol}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">${p.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  <span className={`text-xs ml-2 ${p.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.change24h >= 0 ? '+' : ''}{p.change24h?.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
    </div>
  );
}
