# Agents

## Cursor Cloud specific instructions

### Project Overview

OmniWallet Pro is a stateless Vercel-deployed Web3 wallet analytics dashboard. The entire codebase is 3 files:
- `frontend/index.html` — self-contained SPA (inline JS/CSS, CDN-loaded libraries)
- `api/config.js` — Vercel serverless function exposing `COVALENT_KEY` and `ZERION_KEY` env vars
- `vercel.json` — Vercel routing config

There is no package.json, no build step, no test framework, and no npm dependencies.

### Running Locally

Use the included `dev-server.js` (zero-dependency Node.js server) to emulate the Vercel routing:

```
node dev-server.js
```

This serves the frontend at `http://localhost:3000/` and the API at `http://localhost:3000/api/config`. Port can be overridden with `PORT` env var.

Alternatively, if you have Vercel CLI authenticated: `vercel dev` (requires linking the project).

### API Keys

Set these env vars before starting the server to enable full portfolio functionality:
- `COVALENT_KEY` — Covalent API key for token balances, transactions, NFTs
- `ZERION_KEY` — Zerion API key for fallback portfolio data

Without these keys the app still loads and navigates correctly, but the Portfolio module shows an error and several modules remain in loading state.

### Linting / Testing

There are no lint rules, test frameworks, or CI pipelines configured. The project has no `package.json`. Validation is limited to manual browser testing.

### Gotchas

- `api/config.js` uses ESM `export default` syntax (Vercel Node runtime). The `dev-server.js` uses dynamic `import()` to load it.
- All frontend libraries (Tailwind, Chart.js, ethers.js, Font Awesome) are loaded from CDNs — an internet connection is required for the UI to render properly.
- Several modules call public third-party APIs (GoPlus, DexScreener, DefiLlama, CoinGecko, Polymarket, alternative.me). These may be rate-limited or unreachable from sandboxed environments.
