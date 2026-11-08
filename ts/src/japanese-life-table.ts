import { rOth } from './coefficients.js';
import {
  correctedOtherCauseQx,
  type BreastCancerMortalityCorrection,
  MockBreastCancerMortalityCorrection,
} from './breast-cancer-correction.js';
import { getQxFemale, type LifeTableData } from './life-table-loader.js';
import type { CompetingRiskProvider } from './competing-risk.js';

/**
 * Japanese competing-risk provider using MHLW-style life table qx_female.
 * Age advances with years since surgery; breast cancer qx is subtracted to
 * prevent double-counting with the PREDICT breast-specific model.
 */
export class JapaneseLifeTableCompetingRisk implements CompetingRiskProvider {
  constructor(
    private lifeTable: LifeTableData,
    private breastCorrection: BreastCancerMortalityCorrection = new MockBreastCancerMortalityCorrection()
  ) {}

  /** Annual other-cause mortality at `yearSinceSurgery` (0 = surgery year → 0). */
  getAnnualOtherMortality(surgeryAge: number, yearSinceSurgery: number): number {
    if (yearSinceSurgery <= 0) return 0;
    const currentAge = surgeryAge + yearSinceSurgery;
    const allCauseQx = getQxFemale(this.lifeTable, currentAge);
    return correctedOtherCauseQx(allCauseQx, currentAge, this.breastCorrection);
  }

  getBaseAnnualOtherMortality(surgeryAge: number, times: number[]): number[] {
    return times.map((tm) => this.getAnnualOtherMortality(surgeryAge, tm));
  }

  getBaseCumulativeOtherMortality(surgeryAge: number, times: number[]): number[] {
    const annual = this.getBaseAnnualOtherMortality(surgeryAge, times);
    let cumulative = 0;
    return times.map((tm) => {
      if (tm > 0) cumulative += annual[tm];
      return cumulative;
    });
  }

  /**
   * Age effect is embedded in life-table lookup; no extra parametric index.
   * (UK uses mOthPrognosticIndex here to scale the parametric curve.)
   */
  getOtherMortalityIndex(_surgeryAge: number, _radioEnabled?: boolean): number {
    return 0;
  }

  getRadiotherapyOtherAdjustment(radioEnabled?: boolean): number {
    return rOth(radioEnabled);
  }
}
