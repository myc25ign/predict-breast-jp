import type { PredictionOutput } from './predict';

/** PREDICT types-rx low / central / high hazard-ratio scenarios. */
export interface UncertaintyBand {
  years: number[];
  central: number[];
  pessimistic: number[];
  optimistic: number[];
  /** Width at year 15 (optimistic − pessimistic). */
  spreadAt15: number;
}

export function extractUncertaintyBand(
  output: PredictionOutput,
  treatmentKey = 'hrctb'
): UncertaintyBand | null {
  const { raw, surgeryOnly } = output;
  const lowKey = `${treatmentKey}-low`;
  const highKey = `${treatmentKey}-high`;

  const hasBand = raw.some((r) => lowKey in r && highKey in r);
  if (!hasBand) return null;

  const years = output.years;
  const central = raw.map((r, i) => surgeryOnly[i] + (r[treatmentKey] ?? 0));
  const pessimistic = raw.map((r, i) => surgeryOnly[i] + (r[lowKey] ?? r[treatmentKey] ?? 0));
  const optimistic = raw.map((r, i) => surgeryOnly[i] + (r[highKey] ?? r[treatmentKey] ?? 0));

  return {
    years,
    central,
    pessimistic,
    optimistic,
    spreadAt15: (optimistic[15] ?? 0) - (pessimistic[15] ?? 0),
  };
}
