import type { FormState } from './predict';
import { runPrediction } from './predict';

export interface LandscapeCell {
  age: number;
  year: number;
  /** Japan surgery-only survival − UK (fraction). */
  delta: number;
}

export interface AgeProfile {
  age: number;
  /** 15-year surgery-only survival delta (Japan − UK). */
  deltaAt15: number;
  /** Trapezoidal ∫ (S_jp − S_uk) dt over 0…15 years — “累積生存年の差”. */
  cumulativeLifeYearsGained: number;
  ukSurvival15: number;
  japanSurvival15: number;
}

export interface LocalizationLandscape {
  cells: LandscapeCell[];
  profiles: AgeProfile[];
  simulationCount: number;
  peakAge: AgeProfile;
  currentAgeProfile: AgeProfile | null;
}

function trapezoidIntegrate(values: number[], dt = 1): number {
  if (values.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < values.length; i++) {
    sum += ((values[i - 1] ?? 0) + (values[i] ?? 0)) * 0.5 * dt;
  }
  return sum;
}

export function computeLocalizationLandscape(
  baseForm: FormState,
  options: { ageMin?: number; ageMax?: number; ageStep?: number } = {}
): LocalizationLandscape {
  const ageMin = options.ageMin ?? 30;
  const ageMax = options.ageMax ?? 70;
  const ageStep = options.ageStep ?? 2;

  const ages: number[] = [];
  for (let a = ageMin; a <= ageMax; a += ageStep) ages.push(a);

  const cells: LandscapeCell[] = [];
  const profiles: AgeProfile[] = [];
  let simulationCount = 0;

  for (const age of ages) {
    const form = { ...baseForm, age };
    const uk = runPrediction(form, 'uk');
    const jp = runPrediction(form, 'japan');
    simulationCount += 2;

    const deltas = uk.surgeryOnly.map((u, i) => jp.surgeryOnly[i] - u);
    const cumulativeLifeYearsGained = trapezoidIntegrate(deltas);

    profiles.push({
      age,
      deltaAt15: deltas[15] ?? 0,
      cumulativeLifeYearsGained,
      ukSurvival15: uk.surgeryOnly[15] ?? 0,
      japanSurvival15: jp.surgeryOnly[15] ?? 0,
    });

    for (let year = 0; year <= 15; year++) {
      cells.push({
        age,
        year,
        delta: deltas[year] ?? 0,
      });
    }
  }

  const peakAge = profiles.reduce((best, p) =>
    p.cumulativeLifeYearsGained > best.cumulativeLifeYearsGained ? p : best
  );

  const currentAgeProfile =
    profiles.find((p) => p.age === baseForm.age) ??
    profiles.reduce((nearest, p) =>
      Math.abs(p.age - baseForm.age) < Math.abs(nearest.age - baseForm.age) ? p : nearest
    );

  return {
    cells,
    profiles,
    simulationCount,
    peakAge,
    currentAgeProfile,
  };
}

export function deltaToColor(delta: number): string {
  const pct = delta * 100;
  const clamped = Math.max(-2, Math.min(8, pct));
  if (clamped <= 0) {
    const t = (clamped + 2) / 2;
    return `hsl(220, 70%, ${55 + t * 25}%)`;
  }
  const t = clamped / 8;
  return `hsl(${145 - t * 20}, 75%, ${42 + t * 12}%)`;
}
