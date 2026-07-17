import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function RoundOutcomesChart({ data }) {
  const chartData = data
    .slice()
    .sort((a, b) => a.key - b.key)
    .map((d) => ({ round: `R${d.key}`, 'NHLer %': d.nhlerPct, 'Star %': d.starPct, total: d.total }))

  return (
    <div className="chart-card">
      <h3>Outcomes by round</h3>
      <p className="chart-subtitle">Share of picks who became an NHLer (100+ GP) or a star (100+ GP, 0.6+ PPG)</p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="round" stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <YAxis
            stroke="var(--baseline)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            unit="%"
            width={44}
          />
          <Tooltip content={<RoundTooltip />} cursor={{ fill: 'var(--gridline)' }} />
          <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 13 }} />
          <Bar dataKey="NHLer %" fill="var(--series-1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Star %" fill="var(--series-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <TableView data={chartData} />
    </div>
  )
}

function RoundTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const total = payload[0]?.payload?.total
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">
        {label} &middot; {total} picks
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-swatch" style={{ background: p.color }} />
          {p.dataKey}: {p.value}%
        </div>
      ))}
    </div>
  )
}

function TableView({ data }) {
  return (
    <details className="table-view">
      <summary>View as table</summary>
      <table>
        <thead>
          <tr>
            <th>Round</th>
            <th>Picks</th>
            <th>NHLer %</th>
            <th>Star %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.round}>
              <td>{d.round}</td>
              <td>{d.total}</td>
              <td>{d['NHLer %']}%</td>
              <td>{d['Star %']}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
