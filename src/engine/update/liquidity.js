/**
 * Liquidity Update Module
 *
 * Responsible for:
 * - Smoothing market liquidity (L̄)
 * - Computing liquidity stress (λ)
 *
 * Liquidity is treated as the capital base supporting yield,
 * not as protocol-specific AMM math.
 */
import { emaUpdate } from "../../math/ema.js";
import { TIME_CONSTANTS, STRUCTURAL } from "../../config/constants.js";
import { clamp } from "../../math/utils.js";
/**
 * Updates liquidity-related state variables.
 *
 * @param {EngineState} state - Mutable engine state
 * @param {Object} snapshot - Normalized market snapshot
 */
export function updateLiquidity(state, snapshot) {
  // const currentTimestamp = snapshot.timestamp;
  const liquidity = snapshot.liquidity;

  const deltaTime = state.deltaTime;
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) {
    return;
  }
  //console.log("Δt:", state.deltaTime);
  const alpha = 1-Math.exp(-deltaTime/TIME_CONSTANTS.LIQUIDITY)

  // smooth liquidity
  state.avgLiquidity = emaUpdate(
    state.avgLiquidity,
    liquidity,
    deltaTime,
    TIME_CONSTANTS.LIQUIDITY,
  );
  // liquidity stress part
  const referenceLiquidity = STRUCTURAL.LIQUIDITY_REFERENCE;
  if (!Number.isFinite(state.avgLiquidity) || state.avgLiquidity <= 0) {
    state.liquidityStress = 1.0;
  } else {
const rawStress = referenceLiquidity / state.avgLiquidity;

  state.liquidityStress = emaUpdate(
    state.liquidityStress,
    rawStress,
    alpha
  );

  state.liquidityStress = clamp(state.liquidityStress, 0, 1);  }
}
