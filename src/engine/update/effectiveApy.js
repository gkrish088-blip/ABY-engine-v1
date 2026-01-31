/**
 * Effective APY Computation
 *
 * Computes risk-adjusted APY from engine state.
 *
 * This is a pure interpretation layer:
 * - no state mutation
 * - no smoothing
 * - no side effects
 */
import { RISK_WEIGHTS } from "../../config/constants.js";
import { safeSqrt } from "../../math/utils.js";
/**
 * Computes effective (risk-adjusted) APY.
 *
 * @param {EngineState} state - Current engine state
 * @returns {number} Effective APY
 */
export function computeEffectiveApy(state) {
  const mu = state.smoothedAPY;
  const noiseVar = state.noiseVariance;
  const instabilityVar = state.instabilityVariance;
  const liquidityStress = state.liquidityStress;
  if (!Number.isFinite(mu)) return 0;

  const noisePenalty = RISK_WEIGHTS.NOISE * safeSqrt(noiseVar);

  const instabilityPenalty =
    RISK_WEIGHTS.INSTABILITY * Math.sqrt(Math.max(0, instabilityVar));

  const liquidityPenalty =
    RISK_WEIGHTS.LIQUIDITY * Math.max(0, liquidityStress);

  const effectiveApy =
    mu - noisePenalty - instabilityPenalty - liquidityPenalty;
  // eff APY should never exceed smoothed APY
  return Math.min(mu, effectiveApy);
}
