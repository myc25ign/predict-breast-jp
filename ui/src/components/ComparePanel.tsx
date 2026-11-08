import type { PredictionOutput } from '../lib/predict';
import { formatPercent } from '../lib/predict';

interface Props {
  uk: PredictionOutput;
  japan: PredictionOutput;
}

const MILESTONES = [5, 10, 15];

export function ComparePanel({ uk, japan }: Props) {
  return (
    <section className="card compare-panel">
      <h2 className="card__title">UK vs 日本 — ローカライズ効果</h2>
      <p className="compare-panel__desc">
        乳がん特異的リスクは同一。競合リスク（その他死因）のみ差し替えた場合の生存率差です。
      </p>
      <div className="compare-grid">
        {MILESTONES.map((year) => {
          const ukZ = uk.surgeryOnly[year];
          const jpZ = japan.surgeryOnly[year];
          const delta = jpZ - ukZ;
          return (
            <div key={year} className="compare-card">
              <div className="compare-card__year">{year}年後</div>
              <div className="compare-card__row">
                <span>UK</span>
                <strong>{formatPercent(ukZ)}</strong>
              </div>
              <div className="compare-card__row">
                <span>日本</span>
                <strong>{formatPercent(jpZ)}</strong>
              </div>
              <div className={`compare-card__delta ${delta >= 0 ? 'positive' : 'negative'}`}>
                差 {delta >= 0 ? '+' : ''}
                {formatPercent(delta)}pt
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
