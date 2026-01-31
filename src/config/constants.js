/**
 * This file defines ALL frozen parameters used by the engine.
 * No protocol-specific values are allowed here.
 * All time-based parameters are expressed in SECONDS.
 *
 * Changing any value here changes engine behavior globally.
 */
export const TIME_CONSTANTS = {
  //smoothened apy
  APY_LEVEL: 60 * 60, //1HR

  //trend of apy
  APY_TREND: 30 * 60, //   30 mins

  //noise varience
  NOISE_VARIANCE: 2 * 60 * 60, //2 hr

  //instability varience
  INSTABILITY_VARIANCE: 86400*365, //1hr

  //liquidity
  LIQUIDITY: 12 * 60 * 60, //12hr

  //Cconfidence recovery
  CONFIDENCE_RECOVERY: 4 * 60 * 60, //4hr
};

//structural constants

export const STRUCTURAL = {
  //minimum capital base required for yeild reliability
  LIQUIDITY_REFERENCE: 50_000_000,
  MIN_WARMUP_SAMPLES: 15,
};

// RISK PANELTY WEIGHTS

export const RISK_WEIGHTS = {
  // Penalizes random APY noise
  NOISE: 0.3,

  // PENALISES structural instability
  INSTABILITY: 0.6,

  //penalisses liquidity fragility
  LIQUIDITY: 1.0,
};

//confidence dynamics

export const CONFIDENCE = {
  INSTABILITY_DECAY: 0.7, //k1
  LIQUIDITY_DECAY: 1.0, //k2
  TIME_DECAY: 0.05, //k3
  CONFIDENCE_RECOVERY: 10_800, // 3 hours
};

export const DECISION_THRESHOLDS = {
  CONFIDENCE: {
    STABLE: 0.7,
    RISKY: 0.3,
  },

  // Liquidity stress above this is considered dangerous
  LIQUIDITY_STRESS_MAX: 0.95,
  INSTABILITY_THRESHOLD: 0.01,
  GAP_THRESHOLD: 1800,
};

export const LIMITS = {
  CONFIDENCE_MIN: 0.0,
  CONFIDENCE_MAX: 1.0,

  // Prevent runaway APY values
  MAX_ABS_APY: 10_000, // 10,000% cap (engine sanity)
};

export const ENGINE_CONSTANTS = {
  TIME_CONSTANTS,
  STRUCTURAL,
  RISK_WEIGHTS,
  CONFIDENCE,
  DECISION_THRESHOLDS,
  LIMITS,
};
