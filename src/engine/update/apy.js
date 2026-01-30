/**
 * APY Update Module
 *
 * Responsible for updating:
 * - Smoothed APY (μ)
 * - APY Trend (Δμ)
 *
 * This module does NOT:
 * - compute volatility
 * - compute liquidity
 * - compute confidence
 * - make decisions
 */
import { emaUpdate } from "../../math/ema.js";
import { TIME_CONSTANTS } from "../../config/constants.js";
/**
 * Updates APY-related state variables.
 *
 * @param {EngineState} state - Mutable engine state
 * @param {Object} snapshot - Normalized market snapshot
 */
export function updateApy(state, snapshot) {
    const currentTimestamp = snapshot.timestamp;
    const rawAPY = snapshot.rawAPY;

    const deltaTime = currentTimestamp - state.lastTimestamp;
    if(!Number.isFinite(deltaTime) || deltaTime <= 0 ) return ;

    const previousSmoothedAPY = state.smoothedAPY;

    const newSmoothedAPY = emaUpdate(previousSmoothedAPY , rawAPY , deltaTime , TIME_CONSTANTS.APY_LEVEL);

    state.smoothedAPY = newSmoothedAPY

    //update apy trend 

    state.apy.trend = emaUpdate(state.apyTrend,instantaneousDrift , deltaTime , TIME_CONSTANTS.APY_TREND);

    //update last observed values 
    state.lastRawAPY = rawAPY;
    state.lastTimestamp = currentTimestamp;
}
