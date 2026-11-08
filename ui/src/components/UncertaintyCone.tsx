import { useMemo } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PredictionOutput } from '../lib/predict';
import { formatPercent } from '../lib/predict';
import { extractUncertaintyBand } from '../lib/uncertainty-band';

interface Props {
  data: PredictionOutput;
  engineLabel: string;
}

export function UncertaintyCone({ data, engineLabel }: Props) {
  const band = useMemo(() => extractUncertaintyBand(data, 'hrctb'), [data]);

  if (!band) return null;

  const chartData = band.years.map((year, i) => ({
    year,
    pessimistic: band.pessimistic[i] * 100,
    optimistic: band.optimistic[i] * 100,
    central: band.central[i] * 100,
  }));

  return (
    <section className="card uncertainty">
      <h2 className="card__title">不確実性コーン（PREDICT HR 低/中央/高）</h2>
      <p className="uncertainty__desc">
        {engineLabel} — フル治療（hrctb）の生存率。破線は Cox 係数の low / high シナリオ、
        実線は central。15年時点の幅: <strong>{formatPercent(band.spreadAt15)}</strong>
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" label={{ value: '経過年数', position: 'insideBottom', offset: -4 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Line
              type="monotone"
              dataKey="optimistic"
              stroke="#60a5fa"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              name="楽観 (HR high)"
            />
            <Line
              type="monotone"
              dataKey="pessimistic"
              stroke="#60a5fa"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              name="保守 (HR low)"
            />
            <Line
              type="monotone"
              dataKey="central"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={false}
              name="中央"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
