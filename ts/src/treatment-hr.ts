import type { ModelInput, TreatmentHazardRatios } from './types.js';

export interface TypesRxInput {
  erstat: number;
  her2: number;
  horm?: 'h5' | 'h10' | 'yes' | null;
  chemoGen: number;
  radio?: boolean;
  radioSelected?: number | boolean | null;
  bis?: boolean;
  bisSelected?: number | boolean | null;
  tra?: number | boolean | null;
  delay: number;
}

function addVec(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

/** Clojure truthiness: only null, undefined, and false are falsy; 0 is truthy. */
function cljTruthy(v: unknown): boolean {
  return v !== null && v !== undefined && v !== false;
}

const Z_VEC: [number, number, number] = [0, 0, 0];

export function typesRx(input: TypesRxInput, time: number): TreatmentHazardRatios {
  const { erstat, her2, horm, chemoGen, radio, radioSelected, bis, bisSelected, tra, delay } =
    input;

  const hPlus = -0.26;
  const hPlusVec: [number, number, number] = [-0.178, hPlus, 0.2];

  let cVec: [number, number, number];
  if (chemoGen === 2) cVec = [-0.360, -0.248, -0.136];
  else if (chemoGen === 3) cVec = [-0.579, -0.446, -0.313];
  else cVec = Z_VEC;

  const [cHigh, c, cLow] = cVec;

  const hormActive = erstat > 0 && (horm === 'h5' || horm === 'h10' || horm === 'yes');
  let hVecStar: [number, number, number] = hormActive ? [-0.502, -0.3857, -0.212] : Z_VEC;

  const h10Threshold = delay === 0 ? 10 - delay : 9 - delay;
  let hVec: [number, number, number];
  if (erstat > 0 && time > h10Threshold && horm === 'h10') {
    hVec = addVec(hPlusVec, hVecStar) as [number, number, number];
  } else {
    hVec = hVecStar;
  }
  const [hHigh, h, hLow] = hVec;

  const tVec: [number, number, number] =
    her2 === 1 && cljTruthy(tra) ? [-0.533, -0.3567, -0.239] : Z_VEC;
  const [tHigh, t, tLow] = tVec;

  const rVec: [number, number, number] =
    radio && cljTruthy(radioSelected) ? [-0.288, -0.198, -0.105] : Z_VEC;
  const [rHigh, r, rLow] = rVec;

  const bVec: [number, number, number] =
    bis && cljTruthy(bisSelected) ? [-0.32, -0.198, -0.07] : Z_VEC;
  const [bHigh, b, bLow] = bVec;

  const hrVec = addVec(hVec, rVec);
  const [hrHigh, hr, hrLow] = hrVec as [number, number, number];

  const hrcVec = addVec(addVec(hVec, rVec), cVec);
  const [hrcHigh, hrc, hrcLow] = hrcVec as [number, number, number];

  const hrctVec = addVec(hrcVec, tVec);
  const [hrctHigh, hrct, hrctLow] = hrctVec as [number, number, number];

  const hrctbVec = addVec(hrctVec, bVec);
  const [hrctbHigh, hrctb, hrctbLow] = hrctbVec as [number, number, number];

  return {
    z: 0,
    h, 'h-low': hLow, 'h-high': hHigh,
    r, 'r-low': rLow, 'r-high': rHigh,
    c, 'c-low': cLow, 'c-high': cHigh,
    t, 't-low': tLow, 't-high': tHigh,
    b, 'b-low': bLow, 'b-high': bHigh,
    hr, 'hr-low': hrLow, 'hr-high': hrHigh,
    hrc, 'hrc-low': hrcLow, 'hrc-high': hrcHigh,
    hrct, 'hrct-low': hrctLow, 'hrct-high': hrctHigh,
    hrctb, 'hrctb-low': hrctbLow, 'hrctb-high': hrctbHigh,
  };
}

export function getTreatmentTypes(input: TypesRxInput): string[] {
  return Object.keys(typesRx(input, 0));
}

export function toTypesRxInput(model: ModelInput): TypesRxInput {
  return {
    erstat: model.erstat,
    her2: model.her2,
    horm: model.horm,
    chemoGen: model.chemoGen,
    radio: model.radioEnabled,
    radioSelected: model.radio,
    bis: model.bisEnabled,
    bisSelected: model.bis,
    tra: model.tra,
    delay: model.delay,
  };
}
