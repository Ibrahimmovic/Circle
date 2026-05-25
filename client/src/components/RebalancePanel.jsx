import React, { useState, useEffect } from 'react';

export default function RebalancePanel({ regime: _regime }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState('moderate');

  useEffect(() => { fetchRecommendation(); }, [riskTolerance]);

  async function fetchRecommendation() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rebalance/recommend?riskTolerance=${riskTolerance}`);
      const data = await res.json();
      setRecommendation(data);
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
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-400">Risk Profile:</span>
        {['conservative', 'moderate', 'aggressive'].map(r => (
          <button
            key={r}
            onClick={() => setRiskTolerance(r)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              riskTolerance === r
                ? 'bg-arc-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {recommendation && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Current Allocation</h3>
              <AllocationBar data={recommendation.currentAllocation} label="Current" />
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Target Allocation (Regime-Adjusted)</h3>
              <AllocationBar data={recommendation.targetAllocation} label="Target" />
            </div>
          </div>

          {recommendation.reasoning && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Reasoning</h3>
              <div className="space-y-1">
                {recommendation.reasoning.map((line, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {line.startsWith('→') ? <span className="text-arc-400">{line}</span> : line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {recommendation.specificTrades?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recommended Trades</h3>
              <div className="space-y-2">
                {recommendation.specificTrades.map((trade, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/30">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        trade.action === 'BUY' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {trade.action}
                      </span>
                      <span className="font-semibold text-sm">{trade.symbol}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${trade.amount?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{trade.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => alert('Execution queued via Circle Wallets + CCTP')}
                className="mt-4 w-full bg-gradient-to-r from-arc-500 to-indigo-600 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Execute Rebalance via Circle
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AllocationBar({ data }) {
  const colors = { stablecoin: 'bg-blue-500', bluechip: 'bg-purple-500', altcoin: 'bg-orange-500' };
  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-800 mb-2">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className={`${colors[key]} transition-all`} style={{ width: `${val}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Stable {data.stablecoin?.toFixed(0)}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Blue-chip {data.bluechip?.toFixed(0)}%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Alt {data.altcoin?.toFixed(0)}%</span>
      </div>
    </div>
  );
}
