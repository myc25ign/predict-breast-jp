export interface LifeTableData {
  /** age → annual all-cause mortality probability (qx) for females */
  qxByAge: Map<number, number>;
}

export function parseLifeTableCsv(csvContent: string): LifeTableData {
  const lines = csvContent.trim().split(/\r?\n/);
  const qxByAge = new Map<number, number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    const header = line.toLowerCase();
    if (i === 0 && header.includes('age') && header.includes('qx')) continue;

    const [ageStr, qxStr] = line.split(',').map((s) => s.trim());
    const age = parseInt(ageStr, 10);
    const qx = parseFloat(qxStr);
    if (!Number.isNaN(age) && !Number.isNaN(qx)) {
      qxByAge.set(age, qx);
    }
  }

  if (qxByAge.size === 0) {
    throw new Error('Life table CSV contains no valid rows');
  }

  return { qxByAge };
}

export function loadLifeTableFromCsv(csvContent: string): LifeTableData {
  return parseLifeTableCsv(csvContent);
}

export function getQxFemale(data: LifeTableData, age: number): number {
  const clamped = Math.max(0, Math.min(110, Math.round(age)));
  if (data.qxByAge.has(clamped)) {
    return data.qxByAge.get(clamped)!;
  }
  const ages = [...data.qxByAge.keys()].sort((a, b) => a - b);
  const fallback = ages[ages.length - 1];
  return data.qxByAge.get(fallback) ?? 0;
}
