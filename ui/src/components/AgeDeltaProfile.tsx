import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AgeProfile } from '../lib/localization-landscape';

interface Props {
  profiles: AgeProfile[];
  patientAge: number;
}

export function AgeDeltaProfile({ profiles, patientAge }: Props) {
  const chartData = profiles.map((p) => ({
    age: p.age,
    delta15: p.deltaAt15 * 100,
    cumulative: p.cumulativeLifeYearsGained,
  }));

  return (
    <section className="card age-delta">
      <h2 className="card__title">年齢別 — ローカライズの「効き目」</h2>
      <p className="age-delta__desc">
        15年時点の生存率差（日本 − UK）。赤線は現在の患者年齢。
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottom', offset: -4 }} />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            label={{ value: 'Δ生存率', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(v, name) =>
              name === 'delta15' ? `${Number(v).toFixed(2)}%` : `${Number(v).toFixed(2)} 年`
            }
          />
          <ReferenceLine x={patientAge} stroke="#dc2626" strokeDasharray="4 4" label="患者" />
          <Line
            type="monotone"
            dataKey="delta15"
            stroke="#059669"
            strokeWidth={2.5}
            dot={false}
            name="15年Δ"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="age-delta__foot">
        高齢になるほど日本生命表の影響が効く — 競合リスクの年齢構造そのものが、この曲線を描いています。
      </p>
    </section>
  );
}
