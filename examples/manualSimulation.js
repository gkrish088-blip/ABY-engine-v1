/**
 * Manual Simulation — Long Horizon
 *
 * Purpose:
 * Validate engine behavior over long streaming sequences.
 * Each scenario runs 200 snapshots.
 */

import { YieldAnalyticsEngine } from "../src/engine/Engine.js";

const BASE_TIME = 0;
const STEP = 300; // 5 minutes

function logCheckpoint(label, result, i) {
  console.log(`\n[${label} t=${i}]`);
 // console.log(`Decision: ${result.decision}`);
  console.log(`Smoothed APY: ${result.metrics.smoothedAPY.toFixed(2)}%`);
  console.log(`Effective APY: ${result.metrics.effectiveAPY.toFixed(2)}%`);
  console.log(`Raw APY: ${result.metrics.rawAPY.toFixed(2)}%`);
  console.log(`asset: ${result.metrics.asset}`);
 // console.log(`Confidence: ${result.metrics.confidence.toFixed(3)}`);
  console.log(
    `Risk → noise=${result.metrics.risk.noiseVariance.toFixed(3)}, ` +
    `instability=${result.metrics.risk.instabilityVariance.toFixed(3)}, ` +
    `liquidityStress=${result.metrics.risk.liquidityStress.toFixed(3)}`
  );
}

function snapshot({ t, apy, liquidity }) {
  return {
    marketId: "demo-market",
    protocol: "Demo",
    chain: "DemoChain",
    asset: "USDC",
    price: null,
    volume: null,
    rawAPY: apy,
    liquidity,
    timestamp: t
  };
}
function scenarioIncentiveSpike() {
  console.log("\n=== SCENARIO 1: INCENTIVE SPIKE ===");

  const first = snapshot({ t: BASE_TIME, apy: 8, liquidity: 100_000_000 });
  const engine = new YieldAnalyticsEngine(first);

  for (let i = 1; i <= 200; i++) {
    const t = BASE_TIME + i * STEP;

    let apy;
    if (i < 30) apy = 8 + i * 0.3;     // ramp up
    else if (i < 60) apy = 20;         // spike plateau
    else apy = 8 + Math.sin(i / 5);    // normalize

    const snap = snapshot({ t, apy, liquidity: 110_000_000 });
    const result = engine.update(snap);

    if (i % 50 === 0) logCheckpoint("Incentive", result, i);
  }
}
function scenarioLiquidityRug() {
  console.log("\n=== SCENARIO 2: LIQUIDITY RUG ===");

  const first = snapshot({ t: BASE_TIME, apy: 8, liquidity: 150_000_000 });
  const engine = new YieldAnalyticsEngine(first);

  for (let i = 1; i <= 200; i++) {
    const t = BASE_TIME + i * STEP;

    let liquidity;
    if (i < 80) liquidity = 150_000_000;
    else liquidity = 5_000_000; // rug

    const snap = snapshot({ t, apy: 8, liquidity });
    const result = engine.update(snap);

    if (i % 50 === 0) logCheckpoint("Rug", result, i);
  }
}
function scenarioNoise() {
  console.log("\n=== SCENARIO 3: HIGH NOISE ===");

  const first = snapshot({ t: BASE_TIME, apy: 8, liquidity: 100_000_000 });
  const engine = new YieldAnalyticsEngine(first);

  for (let i = 1; i <= 200; i++) {
    const t = BASE_TIME + i * STEP;
    const apy = 8 + Math.sin(i) * 3; // oscillation
    const snap = snapshot({ t, apy, liquidity: 100_000_000 });
    const result = engine.update(snap);

    if (i % 50 === 0) logCheckpoint("Noise", result, i);
  }
}
function scenarioGap() {
  console.log("\n=== SCENARIO 4: DATA GAP ===");

  const first = snapshot({ t: BASE_TIME, apy: 8, liquidity: 100_000_000 });
  const engine = new YieldAnalyticsEngine(first);

  for (let i = 1; i <= 200; i++) {
    const t = BASE_TIME + i * STEP;

    let timestamp = t;
    if (i === 120) timestamp += 8 * 3600; // 8h gap

    const snap = snapshot({ t: timestamp, apy: 8, liquidity: 100_000_000 });
    const result = engine.update(snap);

    if (i % 50 === 0) logCheckpoint("Gap", result, i);
  }
}
scenarioIncentiveSpike();
scenarioLiquidityRug();
scenarioNoise();
scenarioGap();

