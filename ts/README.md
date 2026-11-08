# PREDICT Breast — TypeScript Core Engine

UK PREDICT Breast v2.1 algorithm port (Phase 1).

## Structure

```
src/
  coefficients.ts      # PI, biomarker HR, age/detection helpers
  baseline-hazard.ts   # ER± breast baseline + UK other-cause baseline
  treatment-hr.ts      # Treatment hazard ratios (types-rx)
  competing-risk.ts    # UK parametric competing risk provider
  input-normalizer.ts  # UI → model input mapping (predict2 adapter)
  predict-engine.ts    # Main engine (cljs-predict port)
  math.ts              # deltas, cumulativeSum, etc.
  types.ts
```

## Usage

```typescript
import { cljsPredict, normalizePatientInput } from './src/index.js';

const result = cljsPredict({
  age: 25,
  size: 2,
  nodes: 2,
  grade: 1,
  erstat: 1,
  detection: 1,
  her2: 1,
  ki67: 1,
  rtime: 15,
  chemoGen: 3,
  bisEnabled: true,
  bis: 1,
  radioEnabled: false,
  horm: 'h5',
  tra: 1,
  delay: 0,
});

// result[year]['hrctb'] = cumulative treatment benefit over surgery
```

## Japanese competing risk (Phase 2)

```typescript
import { readFileSync } from 'node:fs';
import {
  PredictEngine,
  JapaneseLifeTableCompetingRisk,
  loadLifeTableFromCsv,
} from './src/index.js';

const lifeTable = loadLifeTableFromCsv(
  readFileSync('./data/mock_mhlw_life_table.csv', 'utf-8')
);
const engine = new PredictEngine(new JapaneseLifeTableCompetingRisk(lifeTable));
```

Life table CSV format: `age,qx_female` (ages 0–110).

Breast cancer double-counting is prevented via `BreastCancerMortalityCorrection`
(subtracts population breast-cancer qx from all-cause qx; mock uses fixed 0.00001).

## Tests

```bash
npm test
```

Golden data from `test/cljs/predict/models/predict_test.cljs`.
UK vs Japan comparison in `tests/japanese-competing-risk.test.ts`.
