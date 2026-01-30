/**
 * Volatility Update Module
 *
 * Responsible for updating:(trend part)
 * - Noise variance (σ²): random fluctuations around smoothed APY
 * - Instability variance (σΔ²): unpredictability of APY changes
 *
 * This module does NOT:
 * - update APY level
 * - update liquidity
 * - update confidence
 * - make decisions
 */
import { emaUpdate } from "../../math/ema.js";
import { TIME_CONSTANTS } from "../../config/constants.js";
/**
 * Updates APY volatility-related state variables.
 *
 * @param {EngineState} state - Mutable engine state
 * @param {Object} snapshot - Normalized market snapshot
 */
export function updateVolatility(state, snapshot) {
  const currentTimestamp = snapshot.timestamp;
  const rawAPY = snapshot.rawAPY;

  const deltaTime = currentTimestamp - state.lastTimestamp;
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) return;
  const residual = rawAPY - state.smoothedAPY;
  const residualSquared = residual * residual;

  state.noiseVariance = emaUpdate(
    state.noiseVariance,
    residualSquared,
    deltaTime,
    TIME_CONSTANTS.NOISE_VARIANCE,
  );
  const deltaAPY = rawAPY - state.lastRawAPY;
  const deltaAPYSquared = deltaAPY * deltaAPY;

  state.instabilityVariance = emaUpdate(
    state.instabilityVariance,
    deltaAPYSquared,
    deltaTime,
    TIME_CONSTANTS.INSTABILITY_VARIANCE,
  );
}
