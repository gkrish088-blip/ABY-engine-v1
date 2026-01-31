/**
 * In-memory store
 *
 * Holds the latest engine output per market and asset.
 * API routes read only from here; no blockchain or indexer access.
 */

import { YieldAnalyticsEngine } from "../src/engine/Engine.js";

/**
 * Latest analytics per market and asset.
 * Shape: { [marketId]: { [asset]: { marketId, asset, timestamp, metrics } } }
 */
const state = {};

/**
 * One engine per (marketId, asset). Lazily created on first snapshot.
 * @type {Map<string, InstanceType<typeof YieldAnalyticsEngine>>}
 */
const engines = new Map();

function engineKey(marketId, asset) {
  return `${marketId}\u0000${asset}`;
}

/**
 * Process a normalized snapshot: get or create engine, update, store result.
 * Called only from the block handler (indexer → store pipeline).
 *
 * @param {{ marketId: string, asset: string, rawAPY: number, liquidity: number, timestamp: number }} snapshot
 * @returns {void}
 */
export function processSnapshot(snapshot) {
  const { marketId, asset } = snapshot;
  const key = engineKey(marketId, asset);

  let engine = engines.get(key);
  if (!engine) {
    engine = new YieldAnalyticsEngine(snapshot);
    engines.set(key, engine);
  }

  const output = engine.update(snapshot);

  if (!state[marketId]) {
    state[marketId] = {};
  }
  state[marketId][asset] = {
    marketId: output.marketId,
    asset,
    timestamp: output.timestamp,
    metrics: output.metrics,
  };
}

/**
 * Read-only view of latest analytics. Used by API routes.
 * @returns {Record<string, Record<string, { marketId: string, asset: string, timestamp: number, metrics: object }>>}
 */
export function getState() {
  return state;
}
