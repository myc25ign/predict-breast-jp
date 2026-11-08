import { PredictEngine } from '@predict/predict-engine';
import { UKParametricCompetingRisk } from '@predict/competing-risk';
import { JapaneseLifeTableCompetingRisk } from '@predict/japanese-life-table';
import { loadLifeTableFromCsv } from '@predict/life-table-loader';
import lifeTableCsv from '../../../ts/data/mock_mhlw_life_table.csv?raw';

export type EngineMode = 'uk' | 'japan';

const ukEngine = new PredictEngine(new UKParametricCompetingRisk());
const japanLifeTable = loadLifeTableFromCsv(lifeTableCsv);
const japanEngine = new PredictEngine(new JapaneseLifeTableCompetingRisk(japanLifeTable));

export function getPredictEngine(mode: EngineMode): PredictEngine {
  return mode === 'japan' ? japanEngine : ukEngine;
}

export const ENGINE_LABELS: Record<EngineMode, string> = {
  uk: 'イギリス版（UK Parametric）',
  japan: '日本版（厚労省生命表）',
};
