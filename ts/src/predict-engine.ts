import {
  validAge,
  detectionCoeff,
  mapGrade,
  gradeA,
  her2Rh,
  ki67Rh,
  prognosticIndex,
  rOth,
} from './coefficients.js';
import { baseMBr } from './baseline-hazard.js';
import { UKParametricCompetingRisk, calcSCumOthRx } from './competing-risk.js';
import {
  exp,
  deltas,
  cumulativeSum,
  mapOfVectorsToVectorOfMaps,
  years,
} from './math.js';
import { typesRx, toTypesRxInput, getTreatmentTypes } from './treatment-hr.js';
import type { CompetingRiskProvider } from './competing-risk.js';
import type { ModelInput, YearlyResult } from './types.js';

const D_DROP = 6;

export class PredictEngine {
  constructor(private competingRisk: CompetingRiskProvider = new UKParametricCompetingRisk()) {}

  predict(input: ModelInput): YearlyResult[] {
    const d = input.delay === 5;
    const age = validAge(input.age);
    const detection = detectionCoeff(input.detection);
    const grade = mapGrade(input.grade);
    const ga = gradeA(grade);
    const h2rh = her2Rh(input.her2);
    const k67rh = ki67Rh(input.erstat, input.ki67);

    const typesRxInput = toTypesRxInput(input);
    const typesRxCurry = (time: number) => typesRx(typesRxInput, time);

    const pi = prognosticIndex({
      age,
      size: input.size,
      nodes: input.nodes,
      grade,
      gradeA: ga,
      erstat: input.erstat,
      detection,
      her2Rh: h2rh,
      ki67Rh: k67rh,
      radio: input.radioEnabled,
    });

    const mi = this.competingRisk.getOtherMortalityIndex(age, input.radioEnabled);
    const times = Array.from({ length: 16 }, (_, i) => i);
    const yrs = years(input.rtime, input.delay);
    const types = getTreatmentTypes(typesRxInput);

    const baseMCumOth = this.competingRisk.getBaseCumulativeOtherMortality(age, times);
    const baseMOth = this.competingRisk.getBaseAnnualOtherMortality(age, times);

    const sCumOth = baseMCumOth.map((v) => exp(-exp(mi) * v));
    const mCumOth = times.map((tm) => 1 - sCumOth[tm]);
    const mOth = deltas(0, mCumOth);

    const mOth10 = mOth.slice(D_DROP);
    const mOthDash = d ? mOth.slice(D_DROP) : deltas(0, mCumOth);
    const mCumOthDash = cumulativeSum(mOthDash);
    const sCumOthDash = mCumOthDash.map((v) => 1 - v);

    const rOthVal = rOth(input.radioEnabled);
    const rxOth: Record<string, number> = {};
    for (const type of types) {
      rxOth[type] =
        input.radioEnabled && type.includes('r') ? rOthVal : 0;
    }

    const sCumOthRx = calcSCumOthRx(types, times, baseMOth, mi, rxOth);

    let sCumOthRxDash: Record<string, number[]>;
    if (d) {
      sCumOthRxDash = {};
      for (const type of types) {
        sCumOthRxDash[type] = [...sCumOthDash];
      }
    } else {
      sCumOthRxDash = calcSCumOthRx(types, yrs, baseMOth, mi, rxOth);
    }

    const baseMBrValues = baseMBr(input.erstat, times);
    const baseMBrDelayed = baseMBrValues.slice(D_DROP);
    const baseMBrDash = d ? baseMBrValues.slice(D_DROP) : baseMBrValues;

    const sCumBrRx: Record<string, number[]> = {};
    const sCumBrRxDash: Record<string, number[]> = {};

    for (const type of types) {
      const mBrRx = times.map(
        (tm) =>
          exp(typesRxCurry(tm)[type] + pi) * baseMBrValues[tm]
      );
      const mCumBrRx = cumulativeSum(mBrRx);
      sCumBrRx[type] = mCumBrRx.map((v) => exp(-v));

      const mBrRxDash = yrs.map(
        (tm) =>
          exp(typesRxCurry(tm)[type] + pi) * baseMBrDash[tm]
      );
      const mCumBrRxDash = cumulativeSum(mBrRxDash);
      sCumBrRxDash[type] = mCumBrRxDash.map((v) => exp(-v));
    }

    const mBrRx10State1 = yrs.map(
      (tm) =>
        exp(typesRxCurry(tm)['hrctb'] + pi) * baseMBrDelayed[tm]
    );
    const sCumBrRx10 = mBrRx10State1.reduce<number[]>((acc, v) => {
      const cum = (acc.length > 0 ? acc[acc.length - 1] : 0) + v;
      acc.push(exp(-cum));
      return acc;
    }, []);
    if (sCumBrRx10.length > 0) sCumBrRx10.unshift(1);

    const mBrRxDash = vectorFromCumSurvival(sCumBrRxDash);

    const mAllRxDash = diffFromProduct(sCumOthRxDash, sCumBrRxDash);

    const predMBrRxDash: Record<string, number[]> = {};
    for (const type of types) {
      predMBrRxDash[type] = mBrRxDash[type].map((v, tm) => {
        const threshold = d ? tm >= 0 : tm > 0;
        if (!threshold) return 0;
        return (v * mAllRxDash[type][tm]) / (v + mOthDash[tm]);
      });
    }

    const predCumBrRxDash: Record<string, number[]> = {};
    for (const type of types) {
      predCumBrRxDash[type] = cumulativeSum(predMBrRxDash[type]);
    }

    const predCumAllRxDash: Record<string, number[]> = {};
    for (const type of types) {
      const predMOth = mAllRxDash[type].map(
        (v, i) => v - predMBrRxDash[type][i]
      );
      const predCumOth = cumulativeSum(predMOth);
      predCumAllRxDash[type] = predCumBrRxDash[type].map(
        (v, i) => v + predCumOth[i]
      );
    }

    const surgOnlyDash = predCumAllRxDash['z'].map((v) => 1 - v);

    const benefits: Record<string, number[]> = {};
    for (const type of types) {
      benefits[type] = predCumAllRxDash[type].map(
        (v, i) => predCumAllRxDash['z'][i] - v
      );
    }
    benefits['z'] = surgOnlyDash;
    benefits['oth'] = [...sCumOthRxDash['z']];

    const result = mapOfVectorsToVectorOfMaps(benefits);

    if (input.delay === 0) {
      return result;
    }

    const survived: YearlyResult[] = [];
    const zeroRow: YearlyResult = {};
    for (const key of Object.keys(benefits)) {
      zeroRow[key] = 0;
    }
    zeroRow['z'] = 1;
    zeroRow['oth'] = 1;
    for (let i = 0; i <= input.delay; i++) {
      survived.push({ ...zeroRow });
    }
    return [...survived, ...result];
  }
}

function vectorFromCumSurvival(
  sCum: Record<string, number[]>
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const [type, surv] of Object.entries(sCum)) {
    const mCum = surv.map((s) => 1 - s);
    result[type] = deltas(0, mCum);
  }
  return result;
}

function diffFromProduct(
  sCumA: Record<string, number[]>,
  sCumB: Record<string, number[]>
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const type of Object.keys(sCumA)) {
    const mCumAll = sCumA[type].map((a, i) => 1 - a * sCumB[type][i]);
    result[type] = deltas(0, mCumAll);
  }
  return result;
}

/** Direct model call matching cljs-predict interface. */
export function cljsPredict(input: ModelInput): YearlyResult[] {
  return new PredictEngine().predict(input);
}
