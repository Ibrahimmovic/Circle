# Agora Portfolio Agent

**AI-Powered Adaptive Portfolio Manager with Cross-Chain Execution**

Built for the [Agora Agent Hackathon](https://thecanteenapp.com) — exploring how AI agents trade, invest, and interface with markets on [Arc](https://arc.network) with [Circle](https://circle.com) infrastructure.

## What It Does

An autonomous AI agent that continuously monitors market conditions and manages crypto portfolios across chains:

1. **Regime Detection** — Classifies market as Bull/Bear/Crisis/Euphoria/Neutral using Fear & Greed Index, price momentum, and volatility signals
2. **Adaptive Rebalancing** — Adjusts target allocations based on detected regime + user risk tolerance (conservative/moderate/aggressive)
3. **Cross-Chain Execution** — Rebalances across chains via Circle CCTP V2 with sub-second finality on Arc
4. **Market Intelligence** — Real-time asset prices, DeFi yields, and sentiment data

## Tech Stack

- **Circle Wallets** — Secure developer-controlled wallet management
- **Circle CCTP V2** — Native USDC bridging across 7+ chains
- **Circle App Kit** — Bridge, Swap, Send operations via `@circle-fin/app-kit`
- **Arc Testnet** — Sub-second finality, ~$0.01 fees in USDC
- **GoldRush (Covalent)** — On-chain portfolio data
- **Zerion** — Fallback portfolio source
- **CoinGecko / DefiLlama / Alternative.me** — Market signals

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables (see .env.example)
cp .env.example .env

# Run both frontend and backend
npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:3001

## Environment Variables

| Variable | Description |
|----------|------------|
| `CIRCLE_API_KEY` | Circle Wallets API key |
| `KIT_KEY` | Circle App Kit key (for swap operations) |
| `ZERION_KEY` | Zerion portfolio data API key |
| `GOLDRUSH_KEY` | GoldRush/Covalent portfolio API key |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)                 │
│  Portfolio │ Rebalance │ Cross-Chain │ Market     │
└──────────────────────┬──────────────────────────┘
                       │ API Proxy
┌──────────────────────┴──────────────────────────┐
│               Backend (Express)                   │
├─────────────┬─────────────┬──────────────────────┤
│  Market     │  Rebalance  │    Cross-Chain        │
│  Data Svc   │  Engine     │    Engine             │
├─────────────┼─────────────┼──────────────────────┤
│ CoinGecko   │ Regime      │ Circle CCTP V2       │
│ DefiLlama   │ Detection   │ App Kit              │
│ F&G Index   │ Allocation  │ Arc Gateway          │
└─────────────┴─────────────┴──────────────────────┘
         │                            │
    ┌────┴────┐                ┌──────┴──────┐
    │GoldRush │                │Circle Wallets│
    │ Zerion  │                │   Arc L1     │
    └─────────┘                └─────────────┘
```

## Hackathon Categories

- **RFB 04: Adaptive Portfolio Manager** — Regime detection, constant rebalancing, cross-chain
- **RFB 05: Cross-Platform Arbitrage** — Multi-chain execution via CCTP

## License

MIT
