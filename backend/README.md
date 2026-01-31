# Backend

Node.js backend that runs 24/7, indexes Aave v3 on multiple chains, and exposes a public API.

## Setup

```bash
cd backend
npm install
```

## Environment

Set at least one RPC URL (required for startup):

- `ETHEREUM_RPC_URL`
- `POLYGON_RPC_URL`
- `OPTIMISM_RPC_URL`
- `ARBITRUM_RPC_URL`

Optional overrides for Aave v3 Pool address per chain:

- `ETHEREUM_POOL_ADDRESS`, `POLYGON_POOL_ADDRESS`, `OPTIMISM_POOL_ADDRESS`, `ARBITRUM_POOL_ADDRESS`

Optional: `PORT` (default 3000). `BLOCK_THROTTLE_MS` (default 5000) — minimum ms between processing a block per chain; use to avoid RPC rate limits (e.g. Alchemy 429). Set to 0 to process every block. `STARTUP_RPC_DELAY_MS` (default 2000) — delay between each chain’s RPC check at startup so one API key across four chains doesn’t trigger 429.

## Run

```bash
npm start
```

If all RPC URLs are unset, the process exits. Chains with no RPC are skipped and a warning is logged. Chains whose RPC is unreachable at startup are skipped; if no chain can be reached, the process exits.

## API

- **GET /api/v1/markets** — Latest analytics per market and asset. Populated after the first new block per chain.
- **GET /health** — Health check.

Response shape for `/api/v1/markets` (unchanged):

```json
{
  "<marketId>": {
    "<ASSET>": {
      "marketId": "aave-v3-ethereum",
      "asset": "USDC",
      "timestamp": 1234567890,
      "metrics": {
        "smoothedAPY": 4.5,
        "effectiveAPY": 4.2,
        "trend": 0.01,
        "risk": {
          "noiseVariance": 0.001,
          "instabilityVariance": 0.002,
          "liquidityStress": 0.05
        }
      }
    }
  }
}
```

Market IDs: `aave-v3-ethereum`, `aave-v3-polygon`, `aave-v3-optimism`, `aave-v3-arbitrum`. Supported assets: USDC, USDT, USDE (Ethereum only in config), crvUSD (Ethereum only in config); USDC/USDT on L2s. Asset addresses and Pool addresses are in `config/chains.js`.

## Architecture

- **config/chains.js** — Chain list, RPC/env keys, default Pool addresses, asset addresses per chain.
- **provider.js** — One ethers provider per RPC URL; `checkRpc(rpcUrl)`, `onBlock(rpcUrl, callback)`.
- **indexer/aave.js** — Real Aave v3: `getReserveData(asset)`, liquidity rate → APY, aToken totalSupply → liquidity; `getSnapshots(chain, blockNumber, timestamp)`; one asset failure does not crash.
- **store.js** — Unchanged; in-memory store, one engine per (marketId, asset).
- **routes/markets.js** — Unchanged; GET /api/v1/markets reads store only.
- **server.js** — Resolves active chains, verifies RPC per chain, starts Express, registers one block listener per chain; errors on one chain do not affect others.

No database; no auth; API contract unchanged.
