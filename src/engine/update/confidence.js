/**
 * Confidence Update Module
 *
 * Responsible for updating the engine's confidence score.
 *
 * Confidence reflects:
 * - yield instability
 * - liquidity fragility
 * - data staleness
 *
 * Confidence decays quickly on risk,
 * and recovers slowly under stable conditions.
 */
import { CONFIDENCE, TIME_CONSTANTS, LIMITS,STRUCTURAL } from "../../config/constants.js";
import { clamp } from "../../math/utils.js";
/**
 * Updates confidence score.
 *
 * @param {EngineState} state - Mutable engine state
 * @param {Object} snapshot - Normalized market snapshot
 */
export function updateConfidence(state, snapshot) {
 if (state.sampleCount < STRUCTURAL.MIN_WARMUP_SAMPLES) {
  return;
}

 
  //const currentTimestamp = snapshot.timestamp;
const deltaTime = state.deltaTime;
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
    return;
  }
  //console.log("Δt:", state.deltaTime);

  const instabilityPenalty = Math.exp(
    -CONFIDENCE.INSTABILITY_DECAY * state.instabilityVariance,
  );
  const liquidityPenalty = Math.exp(
    -CONFIDENCE.LIQUIDITY_DECAY * state.liquidityStress,
  );

  const timePenalty = Math.exp(-CONFIDENCE.TIME_DECAY * deltaTime);
  state.confidence *= instabilityPenalty;
  state.confidence *= liquidityPenalty;
  state.confidence *= timePenalty;
  //confidence recovery
  const isStable = state.instabilityVariance < 1 && state.liquidityStress < 0.5;

  if (isStable) {
    const recoveryRate = (1 - state.confidence) * (deltaTime / CONFIDENCE.CONFIDENCE_RECOVERY);
    state.confidence += recoveryRate;
  }
  //clamp confidence
  state.confidence = clamp(
    state.confidence,
    LIMITS.CONFIDENCE_MIN,
    LIMITS.CONFIDENCE_MAX,
  );
}
