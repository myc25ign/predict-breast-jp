import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  PredictEngine,
  UKParametricCompetingRisk,
  JapaneseLifeTableCompetingRisk,
  loadLifeTableFromCsv,
  parseLifeTableCsv,
  MockBreastCancerMortalityCorrection,
  correctedOtherCauseQx,
  getQxFemale,
} from '../src/index.js';
import type { ModelInput } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MOCK_CSV_PATH = join(__dirname, '../data/mock_mhlw_life_table.csv');

const testInput: ModelInput = {
  age: 50,
  size: 20,
  nodes: 1,
  grade: 2,
  erstat: 1,
  detection: 1,
  her2: 0,
  ki67: 0,
  rtime: 15,
  chemoGen: 3,
  bisEnabled: true,
  bis: 1,
  radioEnabled: false,
  radio: 0,
  horm: 'h5',
  tra: 0,
  delay: 0,
};

function loadMockLifeTable() {
  return loadLifeTableFromCsv(readFileSync(MOCK_CSV_PATH, 'utf-8'));
}

describe('mock MHLW life table CSV', () => {
  it('has ages 0-110 with expected format', () => {
    const csv = readFileSync(MOCK_CSV_PATH, 'utf-8');
    const data = parseLifeTableCsv(csv);
    expect(data.qxByAge.size).toBe(111);
    expect(data.qxByAge.has(0)).toBe(true);
    expect(data.qxByAge.has(110)).toBe(true);
    expect(getQxFemale(data, 50)).toBeCloseTo(0.00121, 5);
  });
});

describe('breast cancer mortality correction', () => {
  it('subtracts mock breast cancer qx from all-cause qx', () => {
    const correction = new MockBreastCancerMortalityCorrection(0.00001);
    expect(correctedOtherCauseQx(0.00121, 50, correction)).toBeCloseTo(0.0012, 5);
    expect(correctedOtherCauseQx(0.000005, 30, correction)).toBe(0);
  });
});

describe('JapaneseLifeTableCompetingRisk', () => {
  const provider = new JapaneseLifeTableCompetingRisk(loadMockLifeTable());

  it('returns zero mortality at surgery year', () => {
    expect(provider.getAnnualOtherMortality(50, 0)).toBe(0);
  });

  it('advances age with years since surgery', () => {
    const year1 = provider.getAnnualOtherMortality(50, 1); // age 51
    const year10 = provider.getAnnualOtherMortality(50, 10); // age 60
    expect(year1).toBeCloseTo(0.0012595, 5);
    expect(year10).toBeGreaterThan(year1);
  });

  it('uses zero other-mortality index (age in life table)', () => {
    expect(provider.getOtherMortalityIndex(50, false)).toBe(0);
  });
});

describe('UK vs Japan survival comparison (DI)', () => {
  const ukEngine = new PredictEngine(new UKParametricCompetingRisk());
  const jpEngine = new PredictEngine(
    new JapaneseLifeTableCompetingRisk(loadMockLifeTable())
  );

  const ukResult = ukEngine.predict(testInput);
  const jpResult = jpEngine.predict(testInput);

  const ukSurgerySurvival = ukResult.map((r) => r['z']);
  const jpSurgerySurvival = jpResult.map((r) => r['z']);
  const ukHrctbBenefit = ukResult.map((r) => r['hrctb']);
  const jpHrctbBenefit = jpResult.map((r) => r['hrctb']);

  it('produces different surgery-only survival between UK and Japan', () => {
    expect(ukSurgerySurvival[10]).not.toBe(jpSurgerySurvival[10]);
    expect(ukSurgerySurvival[15]).not.toBe(jpSurgerySurvival[15]);
    console.log('\n--- Surgery-only survival (z) ---');
    console.log('Year | UK      | Japan   | Delta');
    for (const year of [1, 5, 10, 15]) {
      const uk = ukSurgerySurvival[year];
      const jp = jpSurgerySurvival[year];
      console.log(
        `${String(year).padStart(4)} | ${(uk * 100).toFixed(3)}% | ${(jp * 100).toFixed(3)}% | ${((jp - uk) * 100).toFixed(3)}%pt`
      );
    }
  });

  it('produces different treatment benefits between UK and Japan', () => {
    expect(ukHrctbBenefit[10]).not.toBe(jpHrctbBenefit[10]);
    console.log('\n--- hrctb treatment benefit ---');
    console.log('Year | UK      | Japan   | Delta');
    for (const year of [1, 5, 10, 15]) {
      const uk = ukHrctbBenefit[year];
      const jp = jpHrctbBenefit[year];
      console.log(
        `${String(year).padStart(4)} | ${(uk * 100).toFixed(3)}% | ${(jp * 100).toFixed(3)}% | ${((jp - uk) * 100).toFixed(3)}%pt`
      );
    }
  });

  it('Japanese survival is plausible for age-50 patient', () => {
    expect(jpSurgerySurvival[15]).toBeGreaterThan(0.7);
    expect(jpSurgerySurvival[15]).toBeLessThan(0.99);
  });

  it('breast cancer correction slightly increases other-cause survival vs uncorrected', () => {
    const uncorrected = new JapaneseLifeTableCompetingRisk(
      loadMockLifeTable(),
      { getPopulationBreastCancerQx: () => 0 }
    );
    const corrected = new JapaneseLifeTableCompetingRisk(loadMockLifeTable());
    const uncorrectedResult = new PredictEngine(uncorrected).predict(testInput);
    const correctedResult = new PredictEngine(corrected).predict(testInput);
    expect(correctedResult[10]['z']).toBeGreaterThanOrEqual(uncorrectedResult[10]['z']);
  });
});
