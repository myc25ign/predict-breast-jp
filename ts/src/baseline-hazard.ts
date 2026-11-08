import { exp, ln, pow, deltas } from './math.js';

export function baseMCumBr(erstat: number, tm: number): number {
  if (tm <= 0) return 0;
  if (erstat > 0) {
    return exp(
      0.7424402 +
        -7.527762 * pow(1.0 / tm, 0.5) +
        -1.812513 * pow(1.0 / tm, 0.5) * ln(tm)
    );
  }
  return exp(-1.156036 + 0.4707332 / pow(tm, 2) + -3.51355 / tm);
}

export function baseMCumOth(times: number[]): number[] {
  return times.map((tm) =>
    exp(-6.052919 + 1.079863 * ln(tm) + 0.3255321 * pow(tm, 0.5))
  );
}

export function baseMBr(erstat: number, times: number[]): number[] {
  const cum = times.map((tm) => baseMCumBr(erstat, tm));
  return deltas(0, cum);
}

export function baseMOth(times: number[]): number[] {
  return deltas(0, baseMCumOth(times));
}
