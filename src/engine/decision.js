/**
 * Decision Module
 *
 * Produces a simple, explainable decision label
 * from the current engine state and derived metrics.
 *
 * Possible outputs:
 * - STABLE
 * - RISKY
 * - AVOID
 */
import { DECISION_THRESHOLDS } from "../config/constants.js";
/**
 * Computes decision label.
 *
 * @param {Object} params
 * @param {number} params.confidence
 * @param {number} params.effectiveApy
 * @param {number} params.instabilityVariance
 * @param {number} params.liquidityStress
 *
 * @returns {"STABLE" | "RISKY" | "AVOID"}
 */
export function decide({
  confidence,
  effectiveApy,
  instabilityVariance,
  liquidityStress,
  smoothedAPY,
}) {
  if (!Number.isFinite(effectiveApy)) {
    return "AVOID";
  }
  if (effectiveApy <= 0 && state.confidence < 0.3) {
    return "AVOID";
  }

  if (liquidityStress >= DECISION_THRESHOLDS.LIQUIDITY_STRESS_MAX) {
    return "AVOID";
  }

  if (confidence < DECISION_THRESHOLDS.CONFIDENCE.RISKY) {
    return "AVOID";
  }
  if (confidence < DECISION_THRESHOLDS.CONFIDENCE.STABLE) {
    return "RISKY";
  }
  const normalizedInstability =
    instabilityVariance / (smoothedAPY * smoothedAPY);

  if (normalizedInstability > DECISION_THRESHOLDS.INSTABILITY_THRESHOLD) {
    return "RISKY";
  }

  return "STABLE";
}
