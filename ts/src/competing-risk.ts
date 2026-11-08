import { exp } from './math.js';
import { baseMCumOth, baseMOth } from './baseline-hazard.js';
import { mOthPrognosticIndex, rOth } from './coefficients.js';
import { cumulativeSum } from './math.js';

export interface CompetingRiskProvider {
  getBaseCumulativeOtherMortality(surgeryAge: number, times: number[]): number[];
  getBaseAnnualOtherMortality(surgeryAge: number, times: number[]): number[];
  getOtherMortalityIndex(surgeryAge: number, radioEnabled?: boolean): number;
  getRadiotherapyOtherAdjustment(radioEnabled?: boolean): number;
}

/** UK parametric competing risk — matches cljs base-m-cum-oth* formula. */
export class UKParametricCompetingRisk implements CompetingRiskProvider {
  getBaseCumulativeOtherMortality(_surgeryAge: number, times: number[]): number[] {
    return baseMCumOth(times);
  }

  getBaseAnnualOtherMortality(_surgeryAge: number, times: number[]): number[] {
    return baseMOth(times);
  }

  getOtherMortalityIndex(age: number, radioEnabled?: boolean): number {
    return mOthPrognosticIndex(age, radioEnabled);
  }

  getRadiotherapyOtherAdjustment(radioEnabled?: boolean): number {
    return rOth(radioEnabled);
  }
}

export function calcSCumOthRx(
  types: string[],
  times: number[],
  baseMOthValues: number[],
  mi: number,
  rxOth: Record<string, number>
): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const type of types) {
    const mOthRx = times.map(
      (tm) => baseMOthValues[tm] * exp(mi + (rxOth[type] ?? 0))
    );
    const mCumOthRx = cumulativeSum(mOthRx);
    result[type] = mCumOthRx.map((v) => exp(-v));
  }
  return result;
}

export function buildRxOth(
  types: string[],
  radioEnabled?: boolean
): Record<string, number> {
  const rOthVal = rOth(radioEnabled);
  const result: Record<string, number> = {};
  for (const type of types) {
    result[type] =
      radioEnabled && type.includes('r') && type !== 'hr' && !type.startsWith('hr')
        ? rOthVal
        : radioEnabled && (type === 'r' || type.startsWith('r-'))
          ? rOthVal
          : 0;
  }
  return result;
}
