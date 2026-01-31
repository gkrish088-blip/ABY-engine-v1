# ABY Yield Analytics Engine

> Deterministic • Explainable • Protocol-Agnostic DeFi Yield Analytics

A lightweight JavaScript engine that analyzes streaming DeFi market snapshots and produces interpretable yield analytics — **without machine learning, randomness, or black-box models.**

---

## Features

- Deterministic – Same input → Same output
- Explainable Math – Every metric is traceable
- Protocol Agnostic – Works across DeFi platforms
- Stateful Streaming Engine – Designed for live data
- Lightweight – No heavy dependencies
- Multi-Dimensional Risk Metrics

---

## Use Cases

- DeFi Dashboards  
- Yield Aggregators  
- Analytics Platforms  
- Risk Monitoring Tools  
- Backtesting & Simulation  
- Research Projects  

---

## Input Snapshot Format

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

**Rules**
- Snapshots must be chronological
- One engine instance per market
- No missing timestamps unless testing gaps

---

## Output Metrics

```js
{
  marketId,
  timestamp,
  metrics: {
    smoothedAPY,
    effectiveAPY,
    trend,
    asset,
    risk: {
      noiseVariance,
      instabilityVariance,
      liquidityStress
    }
  }
}
```

---

## Risk Dimensions

| Metric | Description |
|-------|------------|
| Noise Variance | Short-term APY fluctuations |
| Instability Variance | Structural unpredictability |
| Liquidity Stress | Capital fragility / rug risk |

---

## Architecture

```
EngineState
   ↓
YieldAnalyticsEngine.update(snapshot)
   ↓
Modules
 ├─ updateApy
 ├─ updateVolatility
 ├─ updateLiquidity
 └─ computeEffectiveApy
```

**Design Principles**

- EngineState → Data Only  
- Modules → Pure Mathematics  
- Engine → Orchestration & Time Control  
- No Cross-Domain Mutation  

---

## Installation

```bash
git clone <repo-url>
cd ABY-engine-v1
npm install
```

---

## Usage

### Initialize Engine

```js
import { YieldAnalyticsEngine } from "./src/engine/Engine.js";

const engine = new YieldAnalyticsEngine(initialSnapshot);
```

### Process Snapshot

```js
const result = engine.update(newSnapshot);
console.log(result.metrics);
```

---

## Manual Simulation

Run long-horizon validation scenarios:

```bash
node examples/manualSimulation.js
```

### Scenarios Included

| Scenario | Purpose |
|---------|--------|
| Incentive Spike | Yield ramp & plateau |
| Liquidity Rug | Liquidity collapse |
| High Noise | Oscillating APY |
| Data Gap | Timestamp discontinuity |

Each scenario runs **200 ticks** to validate stability.

---

## Mathematical Model

The engine uses:

- EMA Smoothing – Yield level & trend  
- Variance EMA – Volatility estimation  
- Time-Weighted Decay – Gap awareness  
- No Machine Learning  
- No Randomness  

This guarantees reproducibility and auditability.

---

## Gap Handling

Large timestamp gaps introduce **mild structural instability** instead of false volatility.

| Gap Type | Example |
|---------|--------|
| Soft Gap | ~30 minutes |
| Hard Gap | ~2 hours |

---

## Determinism Guarantee

- No randomness  
- No hidden state mutation  
- Pure functional updates  
- Fully reproducible results  

Ideal for finance, auditing, and analytics tooling.

---

## Future Extensions

- Confidence Scoring  
- Decision Labels  
- Portfolio Aggregation  
- Alert Thresholds  
- Historical Backtesting  

---

## License

MIT

---

## Author

**Krish**  
Deterministic DeFi Analytics Engineering

---

## One-Line Summary

Deterministic DeFi Yield Analytics Engine producing interpretable APY and risk metrics using pure mathematics — **no ML, no black boxes, fully explainable.**
