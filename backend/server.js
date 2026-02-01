/**
 * Server entry point
 *
 * - Multi-chain: uses ETHEREUM_RPC_URL, POLYGON_RPC_URL, OPTIMISM_RPC_URL, ARBITRUM_RPC_URL.
 * - Fail fast if ALL RPCs are missing; skip chains whose RPC is unreachable.
 * - Subscribes to new blocks per chain; fetches Aave v3 data, feeds engine, stores in memory.
 * - API routes read only from in-memory state.
 */
import dotenv from "dotenv";
// Load .env from cwd (backend/ when run as npm start); override so .env wins over shell env
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import { checkRpc, onBlock } from "./provider.js";
import { getSnapshots, getChains } from "./indexer/aave.js";
import { processSnapshot } from "./store.js";
import { getMarkets } from "./routes/markets.js";
import { CHAIN_KEYS, CHAIN_NAMES, RPC_ENV_KEYS } from "./config/chains.js";

const PORT = Number(process.env.PORT) || 3000;
// Minimum ms between processing blocks per chain; reduces RPC load (e.g. avoid Alchemy 429)
const BLOCK_THROTTLE_MS = Number(process.env.BLOCK_THROTTLE_MS) || 5000;
// Delay between each chain's RPC check at startup (avoids 429 when all chains use same API key)
const STARTUP_RPC_DELAY_MS = Number(process.env.STARTUP_RPC_DELAY_MS) || 2000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Express app (API only; no blockchain here) ---
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["*"],
}));
app.use(express.json());

app.get("/api/v1/markets", getMarkets);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// --- Start: resolve active chains, verify RPCs, then listen ---
async function start() {
  const activeChains = getChains();

  if (activeChains.length === 0) {
    console.error(
      "All RPCs are missing. Set at least one of: ETHEREUM_RPC_URL, POLYGON_RPC_URL, OPTIMISM_RPC_URL, ARBITRUM_RPC_URL"
    );
    process.exit(1);
  }

  const missingRpc = CHAIN_KEYS.filter((k) => !process.env[RPC_ENV_KEYS[k]]?.trim());
  if (missingRpc.length > 0) {
    console.warn("Chains skipped (no RPC URL):", missingRpc.map((k) => CHAIN_NAMES[k]).join(", "));
  }

  const verifiedChains = [];
  for (let i = 0; i < activeChains.length; i++) {
    if (i > 0 && STARTUP_RPC_DELAY_MS > 0) {
      await sleep(STARTUP_RPC_DELAY_MS);
    }
    const chain = activeChains[i];
    try {
      const blockNumber = await checkRpc(chain.rpcUrl);
      verifiedChains.push(chain);
      console.log("RPC connected:", chain.chainName, "block", blockNumber);
    } catch (err) {
      console.warn("Chain skipped:", chain.chainName, "-", err.message);
    }
  }

  if (verifiedChains.length === 0) {
    console.error("No RPC could be reached. Exiting.");
    process.exit(1);
  }

  // Block listener per chain; throttle per chain to stay under RPC rate limits (e.g. Alchemy 429)
  const firstBlockByChain = new Set();
  const lastProcessedAtByChain = {};
  for (const chain of verifiedChains) {
    onBlock(chain.rpcUrl, async (blockNumber, blockTimestamp) => {
      const now = Date.now();
      if (lastProcessedAtByChain[chain.chainKey] != null && now - lastProcessedAtByChain[chain.chainKey] < BLOCK_THROTTLE_MS) {
        return; // skip this block; throttle
      }
      lastProcessedAtByChain[chain.chainKey] = now;
      try {
        const snapshots = await getSnapshots(chain, blockNumber, blockTimestamp);
        for (const snapshot of snapshots) {
          processSnapshot(snapshot);
        }
        if (!firstBlockByChain.has(chain.chainKey)) {
          firstBlockByChain.add(chain.chainKey);
          console.log("[block] first block received:", chain.chainName, blockNumber);
        }
        console.log("[block]", chain.chainName, blockNumber, "processed", snapshots.length, "snapshots");
      } catch (err) {
        console.error("[block]", chain.chainName, "error:", err.message);
      }
    });
  }

  const server = app.listen(PORT, () => {
    console.log("Server listening on http://localhost:" + PORT);
    console.log("GET /api/v1/markets — latest analytics");
    console.log("GET /health — health check");
    if (BLOCK_THROTTLE_MS > 0) {
      console.log("Block throttle:", BLOCK_THROTTLE_MS, "ms per chain (set BLOCK_THROTTLE_MS=0 to disable)");
    }
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error("Port", PORT, "is already in use. Choose another PORT or stop the other process.");
      console.error("Example: set PORT=3001 && npm start  (Windows)  or  PORT=3001 npm start  (Unix)");
      process.exit(1);
    }
    console.error("Server error:", err.message);
    process.exit(1);
  });
}

start();
