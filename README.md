# ArcFlow Agent

Adaptive portfolio manager and cross-market execution cockpit for the Agora Agents Hackathon.

ArcFlow is designed around RFB 04 and RFB 05: it continuously evaluates portfolio drift, market regime, stablecoin buffers, and execution venues, then produces Circle/Arc-aware rebalance and routing plans.

## Hackathon fit

- **Adaptive Portfolio Manager:** risk-posture controls, live wallet ingestion, stablecoin buffer constraints, volatility-aware target weights, rebalance intent.
- **Cross-Platform / Cross-Chain Execution:** route ranking across Arc, Circle CCTP/Gateway, DEX venues, and RFQ-style liquidity.
- **Circle + Arc primitives:** backend Circle API verification, App/Swap Kit readiness, CCTP/Gateway settlement planning, USDC-native execution and nanopayment telemetry.
- **Market intelligence APIs:** GoldRush, Zerion, CoinGecko, DefiLlama, and Fear & Greed signals.

## Environment variables

Copy `.env.example` into your deployment environment and set the real values there. Do not commit real keys.

```bash
CIRCLE_API_KEY=...
CIRCLE_KIT_KEY=...
CIRCLE_ENV=sandbox
ZERION_API_KEY=...
GOLDRUSH_API_KEY=...
```

Aliases supported by the serverless functions:

- `CIRCLE_API_KEY` or `CIRCLE_API_KEY_SANDBOX`
- `CIRCLE_KIT_KEY` or `CIRCLE_APP_KIT_KEY`
- `GOLDRUSH_API_KEY`, `COVALENT_API_KEY`, or `COVALENT_KEY`
- `ZERION_API_KEY` or `ZERION_KEY`

## API routes

- `GET /api/circle` verifies the Circle API key through Circle `/v1/configuration` and reports App/Swap Kit readiness without exposing secrets.
- `GET /api/portfolio?address=0x...&chain=ethereum` aggregates token balances from GoldRush and Zerion.
- `GET /api/market-signals` fetches CoinGecko prices, DefiLlama USDC yields, and Alternative.me sentiment.
- `GET /api/execution-plan` ranks Circle/Arc-aware settlement and execution routes.
- `GET /api/config` returns safe public configuration metadata.

## Deployment

This repo is configured for Vercel:

- Static UI: `frontend/index.html`
- Serverless routes: `api/*.js`

Set the environment variables in Vercel before sharing the live demo link.
