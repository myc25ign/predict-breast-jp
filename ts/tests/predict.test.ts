import { describe, it, expect } from 'vitest';
import {
  deltas,
  recAge10Sq,
  logAge10,
  rBaseBr,
  rBaseOth,
  rBr,
  rOth,
  validAge,
  detectionCoeff,
  gradeA,
  her2Rh,
  ki67Rh,
  prognosticIndex,
  mOthPrognosticIndex,
  baseMCumBr,
  baseMCumOth,
  baseMBr,
  baseMOth,
  typesRx,
  years,
  cljsPredict,
  normalizePatientInput,
  nodesV2,
  mapGrade,
  PredictEngine,
  calcSCumOthRx,
  cumulativeSum,
  exp,
} from '../src/index.js';
import type { ModelInput } from '../src/types.js';

const EPS = 1e-7;

function approxEq(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) < eps;
}

function approxVec(a: number[], b: number[], eps = EPS): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => approxEq(v, b[i], eps));
}

describe('math utilities', () => {
  it('deltas', () => {
    expect(deltas(0, [1, 2, 4, 8])).toEqual([1, 1, 2, 4]);
    expect(deltas(1, [1, 2, 4, 8])).toEqual([0, 1, 2, 4]);
  });
});

describe('coefficients', () => {
  it('rec-age-10-sq', () => {
    expect(recAge10Sq(10)).toBe(1);
    expect(recAge10Sq(20)).toBe(0.25);
    expect(approxEq(recAge10Sq(25), 0.16)).toBe(true);
  });

  it('log-age-10', () => {
    expect(logAge10(Math.E * 10)).toBe(1);
  });

  it('base constants', () => {
    expect(rBaseBr(true)).toBe(0.133);
    expect(rBaseBr(false)).toBe(0);
    expect(rBaseOth(true)).toBe(-0.047);
    expect(rBaseOth(false)).toBe(0);
    expect(rBr(true)).toBe(-0.198);
    expect(rBr(false)).toBe(0);
    expect(rOth(true)).toBe(0.068);
    expect(rOth(false)).toBe(0);
    expect([0, 1, 2].map(detectionCoeff)).toEqual([0, 1, 0.204]);
    expect([1, 2, 3, 4].map(gradeA)).toEqual([0, 1, 1, 0]);
    expect([0, 1].map(her2Rh)).toEqual([-0.0762, 0.2413]);
    expect([
      ki67Rh(1, 0),
      ki67Rh(1, 1),
      ki67Rh(0, 0),
      ki67Rh(0, 1),
    ]).toEqual([-0.11333, 0.14904, 0, 0]);
  });

  it('prognostic-index', () => {
    const inputs = {
      age: 25,
      size: 2,
      nodes: 2,
      grade: 1,
      detection: 1,
      her2Rh: 0.2413,
      ki67Rh: 0.14904,
      erstat: 1,
      radio: false,
    };
    expect(approxEq(prognosticIndex(inputs), 0.5200516)).toBe(true);
    // cljs :or defaults use radio? false; golden 0.5006... includes +0.133 (stale test data)
    expect(approxEq(prognosticIndex({}), 0.3676471230275893)).toBe(true);
    // cljs test uses :her2_rh (underscore) which doesn't bind; defaults apply
    expect(
      approxEq(
        prognosticIndex({
          age: 25,
          size: 1,
          nodes: 1,
          grade: 1,
          gradeA: 0,
          detection: 0,
          erstat: 1,
          radio: true,
        }),
        -0.5074627543042763
      )
    ).toBe(true);
    // cljs :her2_rh/:ki67_rh (underscore) don't bind; ER- uses grade-a (default 0)
    expect(
      approxEq(
        prognosticIndex({
          age: 90,
          size: 10,
          nodes: 2,
          grade: 2,
          gradeA: 0,
          detection: 0,
          erstat: 0,
          radio: false,
        }),
        -0.36397949827304354
      )
    ).toBe(true);
    expect(
      approxEq(
        prognosticIndex({
          age: 25,
          size: 1,
          nodes: 1,
          grade: 1,
          detection: 1,
          erstat: 1,
          radio: false,
        }),
        -0.8680964143042763
      )
    ).toBe(true);
  });

  it('m-oth-prognostic-index', () => {
    expect(approxEq(mOthPrognosticIndex(65, false), 0.5597244192408362)).toBe(true);
    expect(approxEq(mOthPrognosticIndex(65, true), 0.5127244192408361)).toBe(true);
  });

  it('valid-age', () => {
    expect(validAge(16)).toBe(25);
    expect(validAge(30)).toBe(30);
  });

  it('mapGrade', () => {
    expect(mapGrade(1)).toBe(1);
    expect(mapGrade(2)).toBe(2);
    expect(mapGrade(3)).toBe(3);
    expect(mapGrade(9)).toBe(2.13);
  });
});

describe('baseline hazard', () => {
  it('base-m-cum-br', () => {
    expect(approxEq(baseMCumBr(0, 1), 0.015012789617578808)).toBe(true);
    expect(approxEq(baseMCumBr(1, 1), 0.0011302439325964351)).toBe(true);
    expect(approxEq(baseMCumBr(1, 10), 0.05193237928632519)).toBe(true);
    expect(approxEq(baseMCumBr(0, 10), 0.22253215565946607)).toBe(true);
  });

  it('base-m-cum-oth', () => {
    const times = years(15, 0);
    const expected = [
      0, 0.003255573, 0.00787515, 0.013531566, 0.02014404, 0.027680291,
      0.036128375, 0.045487139, 0.055761969, 0.06696259, 0.079101799,
      0.092194686, 0.106258128, 0.121310438, 0.137371129, 0.154460731,
    ];
    expect(approxVec(baseMCumOth(times), expected)).toBe(true);
  });

  it('base-m-br', () => {
    const times = years(15, 0);
    const expected = [
      0, 0.001130244, 0.003085806, 0.004406595, 0.005250795, 0.005796647,
      0.00615064, 0.006376906, 0.00651561, 0.006592877, 0.00662626,
      0.00662788, 0.0066063, 0.006567684, 0.006516544, 0.006456227,
    ];
    expect(approxVec(baseMBr(1, times), expected)).toBe(true);
  });
});

describe('years', () => {
  it('generates correct ranges', () => {
    expect(years(10, 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(years(10, 5)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(years(15, 0)).toEqual(Array.from({ length: 16 }, (_, i) => i));
    expect(years(15, 5)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('types-rx', () => {
  it('ER- chemo only', () => {
    const result = typesRx(
      { erstat: 0, her2: 0, horm: 'h5', chemoGen: 3, radio: false, bis: false, bisSelected: 1, tra: 1, delay: 0 },
      0
    );
    expect(result.h).toBe(0);
    expect(result.c).toBe(-0.446);
    expect(result.hrctb).toBe(-0.446);
  });

  it('ER+ full treatment h5', () => {
    const result = typesRx(
      { erstat: 1, her2: 1, horm: 'h5', chemoGen: 3, radio: false, bis: true, bisSelected: 1, tra: 0, delay: 0 },
      0
    );
    expect(result.h).toBe(-0.3857);
    expect(result.hrctb).toBe(-1.3864);
  });

  it('ER+ h10 year 15', () => {
    const result = typesRx(
      { erstat: 1, her2: 1, horm: 'h10', chemoGen: 3, radio: false, bis: true, bisSelected: 1, tra: 1, delay: 0 },
      15
    );
    // predict.cljs h-plus = -0.26 (R golden tests used -0.342)
    expect(result.h).toBe(-0.6456999999999999);
    expect(approxEq(result.hrctb, -1.6464)).toBe(true);
  });
});

describe('input normalizer', () => {
  it('nodes-v2 micromets adjustment', () => {
    expect(nodesV2(1, 'yes')).toBe(0.5);
    expect(nodesV2(2, 'no')).toBe(2);
  });

  it('normalizePatientInput maps UI values', () => {
    const model = normalizePatientInput(
      {
        age: 41,
        size: 45,
        nodes: 1,
        grade: 'unknown',
        erStatus: 'yes',
        mode: 'symptomatic',
        her2Status: 'yes',
        ki67Status: 'yes',
        micromets: 'unknown',
      },
      { chemoGen: 3, horm: 'h5' }
    );
    expect(model.grade).toBe(9);
    expect(model.detection).toBe(0);
    expect(model.her2).toBe(1);
    expect(model.ki67).toBe(1);
    expect(model.nodes).toBe(1);
  });
});

describe('intermediate pipeline (h10 test case)', () => {
  const times = years(15, 0);
  const pi = prognosticIndex({
    age: 25,
    size: 2,
    nodes: 2,
    grade: 1,
    detection: 1,
    her2Rh: her2Rh(1),
    ki67Rh: ki67Rh(1, 1),
    erstat: 1,
    radio: false,
  });
  const mi = mOthPrognosticIndex(25, false);

  const typesRxInput = {
    erstat: 1,
    her2: 1,
    horm: 'h10' as const,
    chemoGen: 3,
    radio: false,
    radioSelected: null,
    bis: true,
    bisSelected: 1,
    tra: 1,
    delay: 0,
  };
  const types = Object.keys(typesRx(typesRxInput, 0));
  const rxOth = Object.fromEntries(types.map((t) => [t, 0]));
  const baseMOthValues = baseMOth(times);

  it('s-cum-oth', () => {
    const baseMCumOthValues = baseMCumOth(times);
    const sCumOth = baseMCumOthValues.map((v) => exp(-exp(mi) * v));
    const expected = [
      1, 0.9995388, 0.9988846, 0.9980843, 0.9971495, 0.9960851,
      0.9948934, 0.9935748, 0.9921292, 0.9905557, 0.9888532,
      0.9870202, 0.9850551, 0.9829562, 0.9807216, 0.9783494,
    ];
    expect(approxVec(sCumOth, expected)).toBe(true);
  });

  it('s-cum-oth-rx', () => {
    const sCumOthRx = calcSCumOthRx(types, times, baseMOthValues, mi, rxOth);
    expect(approxEq(sCumOthRx['hrctb'][10], 0.988853189905853)).toBe(true);
    expect(approxEq(sCumOthRx['hrctb'][15], 0.9783494063641098)).toBe(true);
  });

  it('s-cum-br-rx hrctb', () => {
    const baseMBrValues = baseMBr(1, times);
    const typesRxCurry = (time: number) => typesRx(typesRxInput, time);
    const mBrRx = times.map(
      (tm) => exp(typesRxCurry(tm)['hrctb'] + pi) * baseMBrValues[tm]
    );
    const mCumBrRx = cumulativeSum(mBrRx);
    const sCumBrRx = mCumBrRx.map((v) => exp(-v));
    expect(approxEq(sCumBrRx[10], 0.9783999507570005)).toBe(true);
    expect(approxEq(sCumBrRx[15], 0.9680584867583196)).toBe(true);
  });
});

describe('cljs-predict full integration', () => {
  const testInput: ModelInput = {
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
    radio: 0,
    horm: 'h5',
    tra: 1,
    delay: 0,
  };

  const expectedHrctb = [
    0, 0.1423600, 0.5289672, 1.0759822, 1.7200768, 2.4213923,
    3.1543309, 3.9019877, 4.6529417, 5.3993493, 6.135767218134225,
    6.85840054034158, 7.564607730104955, 8.252566579852982,
    8.921043783391924, 9.569233116719345,
  ].map((v) => v / 100);

  it('hrctb benefits match golden data', () => {
    const result = cljsPredict(testInput);
    const hrctb = result.map((r) => r['hrctb']);
    expect(approxVec(hrctb, expectedHrctb, 1e-6)).toBe(true);
  });

  it('PredictEngine produces same results', () => {
    const engine = new PredictEngine();
    const result = engine.predict(testInput);
    const hrctb = result.map((r) => r['hrctb']);
    expect(approxVec(hrctb, expectedHrctb, 1e-6)).toBe(true);
  });

  it('returns 16 yearly results for 15-year horizon', () => {
    const result = cljsPredict(testInput);
    expect(result).toHaveLength(16);
  });
});
