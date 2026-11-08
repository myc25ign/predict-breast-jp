/** UI-level patient input (before normalization). */
export interface PatientInput {
  age: number;
  size: number;
  nodes: number;
  grade: 'grade1' | 'grade2' | 'grade3' | 'unknown';
  erStatus: 'yes' | 'no';
  mode: 'screen' | 'symptomatic' | 'unknown';
  her2Status: 'yes' | 'no' | 'unknown';
  ki67Status: 'yes' | 'no' | 'unknown';
  micromets?: 'yes' | 'no' | 'unknown' | 'disabled';
}

/**
 * Model-level input matching cljs-predict arguments.
 * grade: 1|2|3|9 (9 = unknown → 2.13 internally)
 * detection: 0|1|2
 * her2/ki67: 0|1|9
 */
export interface ModelInput {
  age: number;
  size: number;
  nodes: number;
  grade: number;
  erstat: number;
  detection: number;
  her2: number;
  ki67: number;
  rtime: number;
  chemoGen: number;
  /** :bis? — bisphosphonates available in UI */
  bisEnabled?: boolean;
  /** :bis — bisphosphonates selected */
  bis?: number | boolean | null;
  /** :radio? — radiotherapy available in UI */
  radioEnabled?: boolean;
  /** :radio — radiotherapy selected */
  radio?: number | boolean | null;
  /** :tra — trastuzumab selected */
  tra?: number | boolean | null;
  horm?: 'h5' | 'h10' | 'yes' | null;
  delay: number;
}

export type TreatmentHazardRatios = Record<string, number>;

export interface YearlyResult {
  [key: string]: number;
}
