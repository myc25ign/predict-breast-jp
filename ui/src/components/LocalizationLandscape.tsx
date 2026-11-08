import { formatPercent } from '../lib/predict';
import { deltaToColor, type LocalizationLandscape as LandscapeData } from '../lib/localization-landscape';

interface Props {
  landscape: LandscapeData;
  patientAge: number;
}

const YEARS = Array.from({ length: 16 }, (_, i) => i);

export function LocalizationLandscape({ landscape, patientAge }: Props) {
  const ages = [...new Set(landscape.cells.map((c) => c.age))]
    .filter((a) => a % 2 === 0)
    .sort((a, b) => a - b);

  const cellMap = new Map<string, number>();
  for (const c of landscape.cells) {
    cellMap.set(`${c.age}:${c.year}`, c.delta);
  }

  const { currentAgeProfile, peakAge, simulationCount } = landscape;
  const profile = currentAgeProfile ?? peakAge;

  return (
    <section className="card landscape">
      <div className="landscape__head">
        <div>
          <h2 className="card__title">ローカライズ地形図</h2>
          <p className="landscape__tagline">
            同じ腫瘍プロファイルのまま年齢だけ変え、UK と日本の「その他死因」を
            <strong>{simulationCount.toLocaleString()}回</strong>
            ぶん回した結果です。緑が濃いほど、日本生命表の方が生存率が上がるゾーン。
          </p>
        </div>
        <div className="landscape__stat-box">
          <div className="landscape__stat-label">この患者（{patientAge}歳）</div>
          <div className="landscape__stat-value">
            15年差 {formatPercent(profile.deltaAt15, 2)}
          </div>
          <div className="landscape__stat-sub">
            累積生存年 +{profile.cumulativeLifeYearsGained.toFixed(2)} 年分
          </div>
        </div>
      </div>

      <div className="heatmap-wrap">
        <div className="heatmap-y-label">年齢</div>
        <div className="heatmap">
          <div className="heatmap__x">
            <span />
            {YEARS.filter((y) => y % 5 === 0 || y === 15).map((y) => (
              <span key={y} className="heatmap__x-tick" style={{ gridColumn: y + 2 }}>
                {y}年
              </span>
            ))}
          </div>
          {ages.map((age) => (
            <div key={age} className="heatmap__row">
              <span className={`heatmap__age ${age === patientAge ? 'heatmap__age--you' : ''}`}>
                {age}
              </span>
              {YEARS.map((year) => {
                const delta = cellMap.get(`${age}:${year}`) ?? 0;
                return (
                  <div
                    key={year}
                    className="heatmap__cell"
                    style={{ backgroundColor: deltaToColor(delta) }}
                    title={`${age}歳・${year}年後: 日本−UK ${formatPercent(delta, 2)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="landscape__footer">
        <p>
          最大インパクト帯: <strong>{peakAge.age}歳</strong>付近（累積 +{peakAge.cumulativeLifeYearsGained.toFixed(2)} 生存年）。
          乳がんリスクの式は同一 — 差は競合リスクだけ。
        </p>
        <div className="landscape__legend">
          <span>UK優位</span>
          <div className="landscape__legend-bar" />
          <span>日本優位</span>
        </div>
      </div>
    </section>
  );
}
