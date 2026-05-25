import React from 'react';

const REGIME_STYLES = {
  BULL: { bg: 'bg-green-900/30', border: 'border-green-700/50', text: 'text-green-400', icon: '🐂' },
  BEAR: { bg: 'bg-orange-900/30', border: 'border-orange-700/50', text: 'text-orange-400', icon: '🐻' },
  CRISIS: { bg: 'bg-red-900/30', border: 'border-red-700/50', text: 'text-red-400', icon: '🚨' },
  EUPHORIA: { bg: 'bg-yellow-900/30', border: 'border-yellow-700/50', text: 'text-yellow-400', icon: '🎆' },
  NEUTRAL: { bg: 'bg-indigo-900/30', border: 'border-indigo-700/50', text: 'text-indigo-400', icon: '⚖️' }
};

export default function RegimeBanner({ regime, indicators }) {
  if (!regime) return null;
  const style = REGIME_STYLES[regime.regime] || REGIME_STYLES.NEUTRAL;

  return (
    <div className={`${style.bg} ${style.border} border rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{style.icon}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className={`regime-badge ${style.bg} ${style.text} border ${style.border}`}>
              {regime.regime}
            </span>
            <span className="text-sm text-gray-300">{regime.description}</span>
          </div>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            {regime.signals?.map((s, i) => <span key={i}>• {s}</span>)}
          </div>
        </div>
      </div>
      {indicators && (
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <div className={`text-lg font-bold ${style.text}`}>{indicators.fearGreedIndex}</div>
            <div className="text-gray-500">Fear/Greed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-200">{indicators.avgChange24h > 0 ? '+' : ''}{indicators.avgChange24h}%</div>
            <div className="text-gray-500">24h Avg</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-200">{indicators.volatility}</div>
            <div className="text-gray-500">Volatility</div>
          </div>
        </div>
      )}
    </div>
  );
}
