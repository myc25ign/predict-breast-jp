import type { PatientInput, ModelInput } from './types.js';

const GRADE_V2: Record<PatientInput['grade'], number> = {
  grade1: 1,
  grade2: 2,
  grade3: 3,
  unknown: 9,
};

const ER_STATUS_V2: Record<PatientInput['erStatus'], number> = {
  yes: 1,
  no: 0,
};

const DETECTION_V2: Record<PatientInput['mode'], number> = {
  screen: 1,
  symptomatic: 0,
  unknown: 2,
};

const HER2_STATUS_V2: Record<PatientInput['her2Status'], number> = {
  yes: 1,
  no: 0,
  unknown: 9,
};

const KI67_V2: Record<PatientInput['ki67Status'], number> = {
  yes: 1,
  no: 0,
  unknown: 9,
};

const CHEMO_GEN_V2: Record<string, number> = {
  '': 0,
  '2nd': 2,
  '3rd': 3,
};

export function nodesV2(nodes: number, micromets: PatientInput['micromets']): number {
  if (nodes === 1 && micromets === 'yes') return 0.5;
  return nodes;
}

export interface AdapterOptions {
  enableBis?: boolean;
  enableRadio?: boolean;
  chemoGen?: number | null;
  horm?: 'h5' | 'h10' | 'yes' | null;
  bis?: number | boolean | null;
  tra?: number | boolean | null;
  radio?: number | boolean | null;
  delay?: number;
}

export function normalizePatientInput(
  input: PatientInput,
  options: AdapterOptions = {}
): ModelInput {
  const {
    enableBis = true,
    enableRadio = false,
    chemoGen = 0,
    horm = null,
    bis = null,
    tra = null,
    radio = null,
    delay = 0,
  } = options;

  return {
    age: input.age,
    size: input.size,
    nodes: nodesV2(input.nodes, input.micromets ?? 'no'),
    grade: GRADE_V2[input.grade],
    erstat: ER_STATUS_V2[input.erStatus],
    detection: DETECTION_V2[input.mode],
    her2: HER2_STATUS_V2[input.her2Status],
    ki67: KI67_V2[input.ki67Status],
    rtime: 15,
    chemoGen: chemoGen ?? 0,
    bisEnabled: enableBis,
    bis: bis,
    radioEnabled: enableRadio,
    radio: radio,
    tra: tra,
    horm: horm,
    delay: delay,
  };
}

/** Map chemo UI key to model chemoGen value. */
export function chemoGenFromUI(chemo: '2nd' | '3rd' | null | undefined): number {
  if (!chemo) return 0;
  return CHEMO_GEN_V2[chemo] ?? 0;
}
