export const exp = Math.exp;
export const ln = Math.log;
export const pow = Math.pow;

export function deltas(start: number, values: number[]): number[] {
  const result: number[] = [];
  let prev = start;
  for (const v of values) {
    result.push(v - prev);
    prev = v;
  }
  return result;
}

export function cumulativeSum(values: number[]): number[] {
  const result: number[] = [];
  let sum = 0;
  for (const v of values) {
    sum += v;
    result.push(sum);
  }
  return result;
}

export function mapOfVectorsToVectorOfMaps(
  data: Record<string, number[]>
): Record<string, number>[] {
  const keys = Object.keys(data);
  if (keys.length === 0) return [];
  const len = data[keys[0]].length;
  const result: Record<string, number>[] = [];
  for (let i = 0; i < len; i++) {
    const row: Record<string, number> = {};
    for (const key of keys) {
      row[key] = data[key][i];
    }
    result.push(row);
  }
  return result;
}

export function years(rtime: number, delay: number): number[] {
  const n = Math.round(rtime) - delay + 1;
  return Array.from({ length: n }, (_, i) => i);
}
