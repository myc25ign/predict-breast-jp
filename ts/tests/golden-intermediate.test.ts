import { describe, it, expect } from 'vitest';
import {
  prognosticIndex,
  her2Rh,
  ki67Rh,
  mOthPrognosticIndex,
  baseMOth,
  baseMCumOth,
  years,
  typesRx,
  exp,
  deltas,
  cumulativeSum,
  calcSCumOthRx,
  baseMBr,
} from '../src/index.js';

const EPS = 1e-7;

function approxEq(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) < eps;
}

/** Golden pipeline from predict_test.cljs (h10 types-rx-curry case). */
describe('golden intermediate values (predict_test.cljs)', () => {
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
  const typesRxCurry = (time: number) => typesRx(typesRxInput, time);

  it('m-oth annual mortality', () => {
    const baseMCumOthValues = baseMCumOth(times);
    const sCumOth = baseMCumOthValues.map((v) => exp(-exp(mi) * v));
    const mCumOth = times.map((tm) => 1 - sCumOth[tm]);
    const mOth = deltas(0, mCumOth);
    const expected = [
      0, 0.00046123617167015407, 0.0006541174083168899, 0.0008003477410825077,
      0.0009348109833294815, 0.0010643385361751578, 0.0011917655790886217,
      0.0013185698568098925, 0.0014456233258568485, 0.0015734819269098699,
      0.0017025185649075514, 0.0018329916650901001, 0.001965083612230023,
      0.0020989237199680044, 0.002234602658308771, 0.002372181886146296,
    ];
    expect(approxVec(mOth, expected)).toBe(true);
  });

  it('m-br-rx-1 hrctb year 10 and 15', () => {
    const baseMBrValues = baseMBr(1, times);
    const mBrRxHrctb = times.map(
      (tm) => exp(typesRxCurry(tm)['hrctb'] + pi) * baseMBrValues[tm]
    );
    expect(approxEq(mBrRxHrctb[10], 0.0027862375961101257)).toBe(true);
  });

  it('m-br-rx hrctb annual', () => {
    const baseMBrValues = baseMBr(1, times);
    const mBrRx = times.map(
      (tm) => exp(typesRxCurry(tm)['hrctb'] + pi) * baseMBrValues[tm]
    );
    const sCumBrRx = cumulativeSum(mBrRx).map((v) => exp(-v));
    const mCum = sCumBrRx.map((s) => 1 - s);
    const mBrRxAnnual = deltas(0, mCum);
    expect(approxEq(mBrRxAnnual[1], 0.0004751368)).toBe(true);
    expect(approxEq(mBrRxAnnual[10], 0.0027298560)).toBe(true);
  });

  it('m-all-rx hrctb', () => {
    const sCumOthRx = calcSCumOthRx(types, times, baseMOthValues, mi, rxOth);
    const baseMBrValues = baseMBr(1, times);
    const sCumBrRxHrctb = cumulativeSum(
      times.map((tm) => exp(typesRxCurry(tm)['hrctb'] + pi) * baseMBrValues[tm])
    ).map((v) => exp(-v));
    const mCumAll = times.map((tm) => 1 - sCumOthRx['hrctb'][tm] * sCumBrRxHrctb[tm]);
    const mAllRx = deltas(0, mCumAll);
    expect(approxEq(mAllRx[1], 0.0009361538)).toBe(true);
    expect(approxEq(mAllRx[10], 0.0043698185)).toBe(true);
  });
});

function approxVec(a: number[], b: number[], eps = EPS): boolean {
  return a.length === b.length && a.every((v, i) => approxEq(v, b[i], eps));
}
