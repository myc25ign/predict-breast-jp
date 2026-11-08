import type { PredictionOutput } from '../lib/predict';
import { formatPercent } from '../lib/predict';

interface Props {
  data: PredictionOutput;
}

const DISPLAY_YEARS = [1, 3, 5, 10, 15];

export function ResultsTable({ data }: Props) {
  return (
    <section className="card">
      <h2 className="card__title">数値一覧</h2>
      <div className="table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>経過年</th>
              <th>手術のみ<br />生存率</th>
              {data.treatments.map((t) => (
                <th key={t.key}>
                  {t.label}
                  <br />
                  生存率
                </th>
              ))}
              {data.treatments.map((t) => (
                <th key={`${t.key}-ben`} className="col-benefit">
                  {t.label}
                  <br />
                  上乗せ*
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISPLAY_YEARS.map((year) => {
              const i = year;
              if (i >= data.years.length) return null;
              return (
                <tr key={year}>
                  <td>{year}年</td>
                  <td>{formatPercent(data.surgeryOnly[i])}</td>
                  {data.treatments.map((t) => (
                    <td key={t.key}>{formatPercent(t.survival[i])}</td>
                  ))}
                  {data.treatments.map((t) => (
                    <td key={`${t.key}-b`} className="col-benefit">
                      +{formatPercent(t.benefit[i])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        * 上乗せベネフィット = 手術のみと比較した生存率の改善幅（PREDICTアルゴリズム準拠）
      </p>
    </section>
  );
}
