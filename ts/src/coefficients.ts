import { ln, pow } from './math.js';

export interface PrognosticIndexInput {
  age?: number;
  size?: number;
  nodes?: number;
  grade?: number;
  gradeA?: number;
  erstat?: number;
  detection?: number;
  her2Rh?: number;
  ki67Rh?: number;
  radio?: boolean;
}

const DEFAULT_PI: Required<PrognosticIndexInput> = {
  age: 65,
  size: 19,
  nodes: 1,
  grade: 1,
  gradeA: 0,
  erstat: 1,
  detection: 0,
  her2Rh: -0.0762,
  ki67Rh: -0.11333,
  radio: false,
};

export function recAge10Sq(age: number): number {
  return pow(age / 10, -2.0);
}

export function logAge10(age: number): number {
  return ln(age / 10);
}

export function rBaseBr(radio?: boolean): number {
  return radio ? 0.133 : 0;
}

export function rBaseOth(radio?: boolean): number {
  return radio ? -0.047 : 0;
}

export function rBr(radio?: boolean): number {
  return radio ? -0.198 : 0;
}

export function rOth(radio?: boolean): number {
  return radio ? 0.068 : 0;
}

export function validAge(age: number): number {
  return age < 25 ? 25 : age;
}

export function detectionCoeff(d: number): number {
  return [0, 1, 0.204][d] ?? 0;
}

export function gradeA(grade: number): number {
  return grade === 2 || grade === 3 ? 1 : 0;
}

export function her2Rh(her2: number): number {
  if (her2 === 1) return 0.2413;
  if (her2 === 0) return -0.0762;
  return 0;
}

export function ki67Rh(erstat: number, ki67: number): number {
  if (erstat > 0) {
    if (ki67 === 1) return 0.14904;
    if (ki67 === 0) return -0.11333;
  }
  return 0;
}

export function mapGrade(grade: number): number {
  const grades = [1.0, 2.0, 3.0, 2.13];
  const idx = grade === 9 ? 3 : grade - 1;
  return grades[idx];
}

export function prognosticIndex(input: PrognosticIndexInput = {}): number {
  const p = { ...DEFAULT_PI, ...input };
  const { age, size, nodes, grade, gradeA: ga, erstat, detection, her2Rh, ki67Rh, radio } = p;

  if (erstat > 0) {
    return (
      her2Rh +
      ki67Rh +
      rBaseBr(radio) +
      34.53642 * (recAge10Sq(age) - 0.0287449295) +
      -34.20342 * (recAge10Sq(age) * logAge10(age) - 0.0510121013) +
      0.7530729 * (ln(size / 100) + 1.545233938) +
      0.7060723 * (ln((nodes + 1) / 10) + 1.387566896) +
      0.746655 * grade +
      -0.22763366 * detection
    );
  }

  return (
    her2Rh +
    ki67Rh +
    rBaseBr(radio) +
    0.0089827 * (age - 56.3254902) +
    2.093446 * (pow(size / 100, 0.5) - 0.5090456276) +
    0.6260541 * (ln((nodes + 1) / 10) + 1.086916249) +
    1.129091 * ga
  );
}

export function mOthPrognosticIndex(age: number, radio?: boolean): number {
  return 0.0698252 * (pow(age / 10, 2) - 34.23391957) + rBaseOth(radio);
}
