/**
 * Yield Analytics Engine
 *
 * Orchestrates all update modules to process normalized
 * market snapshots and produce analytics outputs.
 *
 * This engine:
 * - is stateful
 * - processes one market per instance
 * - assumes snapshots arrive in time order
 */
import { EngineState } from "./EngineState.js";

import { updateApy } from "./update/apy.js";
import { updateVolatility } from "./update/volatility.js";
import { updateLiquidity } from "./update/liquidity.js";
//import { updateConfidence } from "./update/confidence.js";

import { computeEffectiveApy } from "./update/effectiveApy.js";
//import { decide } from "./decision.js";
export class YieldAnalyticsEngine {
  constructor(initialSnapshot) {
    if (!initialSnapshot) {
      throw new Error("Initial snapshot is required");
    }

    this.state = new EngineState(initialSnapshot);
  }

  /**
   * Processes a new snapshot and returns engine outputs.
   *
   * @param {Object} snapshot - Normalized market snapshot
   * @returns {Object} Engine output
   */
  update(snapshot) {
    if (!snapshot || snapshot.marketId !== this.state.marketId) {
      throw new Error("Snapshot does not match engine market");
    }

    const currentTimestamp = snapshot.timestamp;

    const deltaTime =
      this.state.lastTimestamp === null
        ? 0
        : currentTimestamp - this.state.lastTimestamp;

    // store for this tick
    this.state.deltaTime = deltaTime;


    // estimation phase (READ old state)
    updateApy(this.state, snapshot);
     // console.log(this.state.lastRawAPY)
    updateVolatility(this.state, snapshot);
    
    updateLiquidity(this.state, snapshot);
    this.state.lastRawAPY = snapshot.rawAPY
    this.state.lastTimestamp = currentTimestamp;
    //interpretition part
    const effectiveApy = computeEffectiveApy(this.state);

    return {
      marketId: this.state.marketId,
      timestamp: snapshot.timestamp,

      metrics: {
        smoothedAPY: this.state.smoothedAPY,
        effectiveAPY: effectiveApy,
        trend: this.state.apyTrend,
        asset:this.state.asset,

        risk: {
          noiseVariance: this.state.noiseVariance,
          instabilityVariance: this.state.instabilityVariance,
          liquidityStress: this.state.liquidityStress,
        },

        //confidence: this.state.confidence,
      },

      //decision,
    };
  }
}
