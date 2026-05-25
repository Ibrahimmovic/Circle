import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import RegimeBanner from './components/RegimeBanner.jsx';
import PortfolioPanel from './components/PortfolioPanel.jsx';
import RebalancePanel from './components/RebalancePanel.jsx';
import CrossChainPanel from './components/CrossChainPanel.jsx';
import MarketIndicators from './components/MarketIndicators.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [regime, setRegime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegime();
    const interval = setInterval(fetchRegime, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRegime() {
    try {
      const res = await fetch('/api/market/regime');
      const data = await res.json();
      setRegime(data);
    } catch (err) {
      console.error('Failed to fetch regime:', err);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: '📊' },
    { id: 'rebalance', label: 'Rebalance', icon: '⚖️' },
    { id: 'crosschain', label: 'Cross-Chain', icon: '🔗' },
    { id: 'market', label: 'Market Intel', icon: '📈' }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <Header />

      {regime && <RegimeBanner regime={regime.regime} indicators={regime.indicators} />}

      <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-arc-500 text-white shadow-lg shadow-arc-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-arc-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-400">Loading market data...</span>
          </div>
        ) : (
          <>
            {activeTab === 'portfolio' && <PortfolioPanel />}
            {activeTab === 'rebalance' && <RebalancePanel regime={regime} />}
            {activeTab === 'crosschain' && <CrossChainPanel />}
            {activeTab === 'market' && <MarketIndicators />}
          </>
        )}
      </main>

      <footer className="mt-12 text-center text-xs text-gray-600 pb-4">
        Built for the Agora Agent Hackathon | Powered by Circle (CCTP, Wallets, App Kit) + Arc
      </footer>
    </div>
  );
}
