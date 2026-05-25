import React from 'react';

export default function Header() {
  return (
    <header className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-arc-400 to-indigo-600 flex items-center justify-center shadow-lg animate-glow">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-arc-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Agora Portfolio Agent
          </h1>
          <p className="text-xs text-gray-500">Adaptive Portfolio Manager + Cross-Chain Execution</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-green-900/40 text-green-400 px-2 py-1 rounded-full border border-green-800/50">
          ● Circle Connected
        </span>
        <span className="text-xs bg-purple-900/40 text-purple-400 px-2 py-1 rounded-full border border-purple-800/50">
          Arc Testnet
        </span>
      </div>
    </header>
  );
}
