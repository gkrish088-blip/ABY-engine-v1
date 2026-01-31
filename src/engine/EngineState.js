/**
 * EngineState
 *
 * Defines the complete internal state of the yield analytics engine
 * for a single market.
 *
 * This state is:
 * - minimal
 * - serializable
 * - protocol-agnostic
 * - designed for incremental, time-based updates
 *
 * No update logic belongs in this file.
 */
export class EngineState {
  constructor(initialSnapshot) {
    //identity
    this.marketId = initialSnapshot.marketId;
    this.protocol = initialSnapshot.protocol;
    this.chain = initialSnapshot.chain;
    this.asset = initialSnapshot.asset;
    

    //Time tracking
    this.lastTimestamp = initialSnapshot.timestamp;

    //yeild level estimation

    this.smoothedAPY = initialSnapshot.rawAPY;
    this.apyTrend = 0;

    //yeild risk estimation
    this.noiseVariance = 0;
    this.instabilityVariance = 0;

    //liquidity conditioning
    this.avgLiquidity = initialSnapshot.liquidity;
    this.liquidityStress = 0;

    //this.confidence = 1.0;

    this.lastRawAPY = initialSnapshot.rawAPY;
    this.deltaTime  = 0;
    //this.sampleCount = 0;

  }
}
