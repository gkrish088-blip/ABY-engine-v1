/**
 * API routes: markets
 *
 * GET /api/v1/markets — returns latest analytics from in-memory store.
 * No blockchain or indexer access; read-only.
 */

import { getState } from "../store.js";

/**
 * GET /api/v1/markets
 *
 * Response: { "<marketId>": { "<ASSET>": { marketId, asset, timestamp, metrics } } }
 * metrics: { smoothedAPY, effectiveAPY, trend, risk: { noiseVariance, instabilityVariance, liquidityStress } }
 */
export function getMarkets(req, res) {
  const state = getState();
  res.json(state);
}
