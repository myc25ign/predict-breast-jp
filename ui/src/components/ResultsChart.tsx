import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PredictionOutput } from '../lib/predict';
import { formatPercent } from '../lib/predict';

interface Props {
  data: PredictionOutput;
}

export function ResultsChart({ data }: Props) {
  const chartData = data.years.map((year, i) => {
    const row: Record<string, number | string> = { year };
    row['手術のみ'] = data.surgeryOnly[i] * 100;
    for (const t of data.treatments) {
      row[t.label] = t.survival[i] * 100;
    }
    return row;
  });

  return (
    <section className="card">
      <h2 className="card__title">15年生存率カーブ</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              label={{ value: '経過年数', position: 'insideBottom', offset: -4 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              label={{ value: '生存率', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) =>
                formatPercent(Number(value) / 100)
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="手術のみ"
              stroke="#64748b"
              strokeWidth={2}
              dot={false}
            />
            {data.treatments.map((t) => (
              <Line
                key={t.key}
                type="monotone"
                dataKey={t.label}
                stroke={t.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
