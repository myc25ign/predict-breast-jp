/**
 * Removes population-level breast cancer mortality from all-cause life-table qx
 * to avoid double-counting with PREDICT's breast-cancer-specific hazard model.
 */

export interface BreastCancerMortalityCorrection {
  /** Annual probability of breast-cancer death in the general female population at `age`. */
  getPopulationBreastCancerQx(age: number): number;
}

/** Mock: subtracts a tiny fixed value at every age (replace with age-specific data later). */
export class MockBreastCancerMortalityCorrection implements BreastCancerMortalityCorrection {
  constructor(private readonly fixedQx: number = 0.00001) {}

  getPopulationBreastCancerQx(_age: number): number {
    return this.fixedQx;
  }
}

export function correctedOtherCauseQx(
  allCauseQx: number,
  age: number,
  correction: BreastCancerMortalityCorrection
): number {
  return Math.max(0, allCauseQx - correction.getPopulationBreastCancerQx(age));
}
