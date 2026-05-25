# Agents

## Cursor Cloud specific instructions

### Project Overview

Agora Portfolio Agent — AI-powered adaptive portfolio manager with cross-chain execution for the Agora Agent Hackathon. Full-stack app: Express backend + Vite/React frontend.

### Running Locally

```bash
npm run dev          # Starts both servers concurrently
npm run dev:server   # Backend only (port 3001, uses --watch)
npm run dev:client   # Frontend only (port 3000, proxies /api to :3001)
```

Frontend at http://localhost:3000, backend at http://localhost:3001.

### Key Gotchas

- **Vite proxy**: The frontend proxies `/api/*` to the backend. Run `npx vite --host` (NOT `npx vite client`) from workspace root — the `root: 'client'` is already in `vite.config.js`.
- **Environment**: API keys must be in `.env` at workspace root. The `.env` file is gitignored.
- **GoldRush (Covalent)**: Free tier has rate limits (~5 req/s). Portfolio endpoint may take 3-6s on first call.
- **Demo data fallback**: If API keys are missing or APIs fail, the app serves demo/fallback data so the UI always renders.
- **ESM modules**: Project uses `"type": "module"` — all imports use ESM syntax.
- **Circle SDK**: `@circle-fin/developer-controlled-wallets` and `@circle-fin/app-kit` are installed but require a valid entity secret for full wallet operations. The TEST_API_KEY works for read-only operations.

### Linting

```bash
npm run lint
```

Uses ESLint 8 with recommended rules. JSX files have React globals configured.

### No automated tests

This is a hackathon project — no test framework is set up. Validation is manual via browser + API curl.
