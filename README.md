

# ABY Yield Analytics Engine

A deterministic, protocol-agnostic DeFi Yield Analytics Engine written in JavaScript.

This engine processes streaming yield market snapshots and produces interpretable analytics such as **Smoothed APY**, **Effective APY**, and multi-dimension **Risk Metrics** — without machine learning or black-box models.

---

## Overview

ABY Engine is designed to be:

- **Deterministic** – Same input always produces the same output
- **Explainable** – Every metric is mathematically traceable
- **Protocol-Agnostic** – Works across any DeFi platform
- **Stateful** – Incremental updates over time
- **Lightweight** – No ML libraries or heavy dependencies

### Intended Use Cases

- DeFi dashboards
- Yield aggregators
- Analytics platforms
- Risk monitoring tools
- Research & simulation environments

---

## Input Format

A **normalized market snapshot** is required for each update:

```js
{
  marketId: "string",
  protocol: "string",
  chain: "string",
  asset: "string",
  rawAPY: number,
  liquidity: number,
  timestamp: number
}
```


Important: Snapshots must arrive in chronological order and belong to the same market.

Output Format

Each update returns analytics metrics:

{
  marketId,
  timestamp,
  metrics: {
    smoothedAPY,
    effectiveAPY,
    trend,
    risk: {
      noiseVariance,
      instabilityVariance,
      liquidityStress
    }
  }
}

Risk Dimensions

The engine separates risk into independent channels instead of using a single opaque score.

Metric	Meaning
Noise Variance	Short-term APY fluctuations
Instability Variance	Structural unpredictability / regime change
Liquidity Stress	Capital fragility / rug risk
Architecture
EngineState
   ↓
YieldAnalyticsEngine.update(snapshot)
   ↓
Modules:
  ├─ updateApy
  ├─ updateVolatility
  ├─ updateLiquidity
  └─ computeEffectiveApy

Design Principles

EngineState → Data only, no logic

Update modules → Pure math

Engine orchestrator → Time management & commit phase

Modules do not interfere with each other’s domains

Installation
git clone <your-repo-url>
cd ABY-engine-v1
npm install

Usage
Initialize Engine
import { YieldAnalyticsEngine } from "./src/engine/Engine.js";

const engine = new YieldAnalyticsEngine(initialSnapshot);

Process Snapshots
const result = engine.update(newSnapshot);
console.log(result.metrics);

Manual Simulation

A simulation script is included to validate long-term behavior.

Run:

node examples/manualSimulation.js

Scenarios Included

Incentive Spike – APY ramps and spikes

Liquidity Rug – Liquidity collapse

High Noise – Oscillating APY

Data Gap – Long timestamp discontinuity

Each scenario runs 200 ticks to test stability and correctness.

Mathematical Model

The engine uses:

EMA Smoothing for APY and trend

Variance EMA for volatility

Time-weighted decay for stability

No Machine Learning

No Randomness

This ensures full determinism and reproducibility.

Gap Handling

Large timestamp gaps introduce mild instability to represent stale data risk without exaggerating volatility.

Typical thresholds:

Type	Example
Soft Gap	~30 minutes
Hard Gap	~2 hours
Determinism Guarantee

No randomness

No hidden state mutation

Pure mathematical updates

Fully reproducible outputs

Ideal for auditing, analytics, and financial tooling.

Future Extensions (Optional)

Confidence scoring

Decision labeling

Portfolio aggregation

Alert thresholds

Historical backtesting

License

MIT (or choose your preferred license)

Author

Krish – Deterministic DeFi Analytics Engineering

One-Line Summary

Deterministic DeFi Yield Analytics Engine producing interpretable APY and risk metrics using pure mathematics — no ML, no black boxes, fully explainable and protocol-agnostic.


---

