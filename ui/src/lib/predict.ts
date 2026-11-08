import type { ModelInput, YearlyResult } from '@predict/types';
import type { EngineMode } from './engines';
import { getPredictEngine } from './engines';

export interface FormState {
  age: number;
  size: number;
  nodes: number;
  grade: 'grade1' | 'grade2' | 'grade3' | 'unknown';
  erStatus: 'yes' | 'no';
  mode: 'screen' | 'symptomatic' | 'unknown';
  her2Status: 'yes' | 'no' | 'unknown';
  ki67Status: 'yes' | 'no' | 'unknown';
  micromets: 'yes' | 'no' | 'unknown' | 'disabled';
  horm: 'none' | 'h5' | 'h10';
  chemo: 'none' | '2nd' | '3rd';
  tra: boolean;
  bis: boolean;
  radio: boolean;
}

export const DEFAULT_FORM: FormState = {
  age: 50,
  size: 20,
  nodes: 1,
  grade: 'grade2',
  erStatus: 'yes',
  mode: 'screen',
  her2Status: 'no',
  ki67Status: 'unknown',
  micromets: 'no',
  horm: 'h5',
  chemo: '3rd',
  tra: false,
  bis: true,
  radio: false,
};

export interface TreatmentSeries {
  key: string;
  label: string;
  color: string;
  /** Cumulative survival (0–1) */
  survival: number[];
  /** Benefit over surgery-only (0–1) */
  benefit: number[];
}

export interface PredictionOutput {
  years: number[];
  surgeryOnly: number[];
  treatments: TreatmentSeries[];
  raw: YearlyResult[];
}

const CHEMO_MAP = { none: 0, '2nd': 2, '3rd': 3 } as const;

export function formToModelInput(form: FormState): ModelInput {
  const gradeMap = { grade1: 1, grade2: 2, grade3: 3, unknown: 9 } as const;
  const erMap = { yes: 1, no: 0 } as const;
  const detectionMap = { screen: 1, symptomatic: 0, unknown: 2 } as const;
  const her2Map = { yes: 1, no: 0, unknown: 9 } as const;
  const ki67Map = { yes: 1, no: 0, unknown: 9 } as const;

  let nodes = form.nodes;
  if (form.nodes === 1 && form.micromets === 'yes') nodes = 0.5;

  return {
    age: form.age,
    size: form.size,
    nodes,
    grade: gradeMap[form.grade],
    erstat: erMap[form.erStatus],
    detection: detectionMap[form.mode],
    her2: her2Map[form.her2Status],
    ki67: ki67Map[form.ki67Status],
    rtime: 15,
    chemoGen: CHEMO_MAP[form.chemo],
    bisEnabled: true,
    bis: form.bis ? 1 : null,
    radioEnabled: form.radio,
    radio: form.radio ? 1 : null,
    tra: form.tra ? 1 : null,
    horm: form.horm === 'none' ? null : form.horm,
    delay: 0,
  };
}

const DISPLAY_TREATMENTS: { key: string; label: string; color: string }[] = [
  { key: 'h', label: 'ホルモン療法', color: '#2563eb' },
  { key: 'hrc', label: 'ホルモン＋化学療法', color: '#7c3aed' },
  { key: 'hrctb', label: 'フル治療（推奨組合せ）', color: '#059669' },
];

export function runPrediction(form: FormState, engineMode: EngineMode): PredictionOutput {
  const input = formToModelInput(form);
  const engine = getPredictEngine(engineMode);
  const raw = engine.predict(input);

  const years = raw.map((_, i) => i);
  const surgeryOnly = raw.map((r) => r['z'] ?? 0);

  const treatments: TreatmentSeries[] = DISPLAY_TREATMENTS.map(({ key, label, color }) => {
    const benefit = raw.map((r) => r[key] ?? 0);
    const survival = benefit.map((b, i) => surgeryOnly[i] + b);
    return { key, label, color, survival, benefit };
  });

  return { years, surgeryOnly, treatments, raw };
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
