import React, { useState, useEffect } from 'react';

export default function CrossChainPanel() {
  const [routes, setRoutes] = useState(null);
  const [fromChain, setFromChain] = useState('ethereum');
  const [toChain, setToChain] = useState('base');
  const [amount, setAmount] = useState('100');
  const [estimate, setEstimate] = useState(null);
  const [bridgeResult, setBridgeResult] = useState(null);

  useEffect(() => { fetchRoutes(); }, []);

  async function fetchRoutes() {
    try {
      const res = await fetch('/api/crosschain/routes');
      const data = await res.json();
      setRoutes(data.routes);
    } catch (err) {
      console.error(err);
    }
  }

  async function getEstimate() {
    try {
      const res = await fetch(`/api/crosschain/estimate?from=${fromChain}&to=${toChain}&amount=${amount}`);
      const data = await res.json();
      setEstimate(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function executeBridge() {
    try {
      const res = await fetch('/api/crosschain/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromChain, toChain, amount, token: 'USDC' })
      });
      const data = await res.json();
      setBridgeResult(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Circle CCTP V2 — Cross-Chain Transfer</h3>
        <p className="text-xs text-gray-500 mb-4">Native USDC bridging with sub-second finality on Arc. No wrapped tokens.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From Chain</label>
            <select
              value={fromChain}
              onChange={e => { setFromChain(e.target.value); setEstimate(null); setBridgeResult(null); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {routes?.chains?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To Chain</label>
            <select
              value={toChain}
              onChange={e => { setToChain(e.target.value); setEstimate(null); setBridgeResult(null); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              {routes?.chains?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setEstimate(null); setBridgeResult(null); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={getEstimate}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Estimate
          </button>
          <button
            onClick={executeBridge}
            className="bg-gradient-to-r from-arc-500 to-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Execute Bridge
          </button>
        </div>
      </div>

      {estimate && (
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-green-400 mb-3">Transfer Estimate</h4>
          {estimate.supported ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-gray-500 block text-xs">Send</span>{estimate.sendAmount} USDC</div>
              <div><span className="text-gray-500 block text-xs">Receive</span>{estimate.receiveAmount} USDC</div>
              <div><span className="text-gray-500 block text-xs">Fee</span>${estimate.fee} ({estimate.feePercentage})</div>
              <div><span className="text-gray-500 block text-xs">Time</span>{estimate.estimatedTime}</div>
              <div className="col-span-2 md:col-span-4"><span className="text-gray-500 block text-xs">Protocol</span><span className="text-arc-400">{estimate.protocol}</span></div>
            </div>
          ) : (
            <p className="text-red-400 text-sm">{estimate.error}</p>
          )}
        </div>
      )}

      {bridgeResult && (
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-arc-400 mb-3">Bridge Execution</h4>
          {bridgeResult.success ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-green-400">{bridgeResult.status}</span>
                <span className="text-xs text-gray-500">ID: {bridgeResult.executionId?.slice(0, 8)}...</span>
              </div>
              <div className="space-y-2">
                {bridgeResult.steps?.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-xs">{step.step}</span>
                    <span className="text-gray-300">{step.action}</span>
                    <span className="text-xs text-yellow-400 ml-auto">{step.status}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400">
                <strong className="text-arc-400">Circle Integration:</strong> {bridgeResult.circleIntegration?.method} via {bridgeResult.circleIntegration?.sdk} (CCTP {bridgeResult.circleIntegration?.cctpVersion})
              </div>
            </div>
          ) : (
            <p className="text-red-400 text-sm">{bridgeResult.error}</p>
          )}
        </div>
      )}

      {routes && (
        <div className="glass-card p-5">
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Supported Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {routes.features?.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-arc-400">✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
