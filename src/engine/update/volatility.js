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
import { DECISION_THRESHOLDS } from "../../config/constants.js";
/**
 * Updates APY volatility-related state variables.
 *
 * @param {EngineState} state - Mutable engine state
 * @param {Object} snapshot - Normalized market snapshot
 */
export function updateVolatility(state, snapshot) {
  const rawAPY = snapshot.rawAPY;

  const deltaTime = state.deltaTime;
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) return;
  if (!Number.isFinite(state.lastRawAPY)) {
    state.lastRawAPY = rawAPY;
    return;
  }
  const residual = rawAPY - state.smoothedAPY;
  const residualSquared = residual * residual;

  state.noiseVariance = emaUpdate(
    state.noiseVariance,
    residualSquared,
    deltaTime,
    TIME_CONSTANTS.NOISE_VARIANCE,
  );

//  if (!Number.isFinite(state.prevRawAPY)) return;

  const deltaAPY = rawAPY - state.lastRawAPY;
  const deltaAPYSquared = deltaAPY * deltaAPY;

  state.instabilityVariance = emaUpdate(
    state.instabilityVariance,
    deltaAPYSquared,
    deltaTime,
    TIME_CONSTANTS.INSTABILITY_VARIANCE,
  );

  // console.log(
  //   "[VOL]",
  //   "rawAPY=",
  //   rawAPY,
  //   "lastRawAPY=",
  //   state.lastRawAPY,
  //   "deltaAPY=",
  //   rawAPY - state.lastRawAPY,
  //   "deltaTime=",
  //   state.deltaTime,
  // );
}
