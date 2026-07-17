import { useMemo, useState } from 'react'
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { teamName, teamLogoUrl } from '../lib/teamNames'

const MIN_PX = 16
const MAX_PX = 48

export function TeamBubbleChart({ data, minSample = 5 }) {
  const [failedLogos, setFailedLogos] = useState(() => new Set())

  const chartData = useMemo(
    () =>
      data
        .filter((d) => d.tierEligible >= minSample)
        .map((d) => ({
          key: d.key,
          fullTimePct: d.fullTimePct,
          starPct: d.tierStarPct,
          totalPicks: d.total,
          n: d.tierEligible,
        })),
    [data, minSample]
  )

  const { minPicks, maxPicks } = useMemo(() => {
    if (chartData.length === 0) return { minPicks: 0, maxPicks: 1 }
    const picks = chartData.map((d) => d.totalPicks)
    return { minPicks: Math.min(...picks), maxPicks: Math.max(...picks) }
  }, [chartData])

  function sizeFor(totalPicks) {
    if (maxPicks === minPicks) return (MIN_PX + MAX_PX) / 2
    const t = Math.sqrt((totalPicks - minPicks) / (maxPicks - minPicks))
    return MIN_PX + t * (MAX_PX - MIN_PX)
  }

  function markFailed(key) {
    setFailedLogos((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  function TeamMarker(props) {
    const { cx, cy, payload } = props
    const size = sizeFor(payload.totalPicks)
    const half = size / 2
    const showLogo = !failedLogos.has(payload.key)
    return (
      <g>
        <circle cx={cx} cy={cy} r={half} fill="var(--surface-1)" stroke="var(--border)" />
        {showLogo && (
          <image
            href={teamLogoUrl(payload.key)}
            x={cx - half}
            y={cy - half}
            width={size}
            height={size}
            onError={() => markFailed(payload.key)}
          />
        )}
      </g>
    )
  }

  if (chartData.length === 0) {
    return <p className="chart-empty">Not enough picks in this filter to show a breakdown.</p>
  }

  return (
    <div className="chart-card">
      <h3>Outcomes by team</h3>
      <p className="chart-subtitle">
        Each team's Full-Time NHLer rate vs. Star rate, sized by total picks made ("kicks at the can") — teams with 5+
        eligible skaters. Bubble area, not radius, is proportional to picks, so a team with 4x the picks gets a bubble
        4x the area.
      </p>
      <ResponsiveContainer width="100%" height={440}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 0 }}>
          <CartesianGrid stroke="var(--gridline)" />
          <XAxis
            type="number"
            dataKey="fullTimePct"
            name="Full-Time NHLer %"
            unit="%"
            stroke="var(--baseline)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            label={{ value: 'Full-Time NHLer %', position: 'insideBottom', offset: -8, fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="starPct"
            name="Star %"
            unit="%"
            stroke="var(--baseline)"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            label={{ value: 'Star %', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <Tooltip content={<BubbleTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--baseline)' }} />
          <Scatter data={chartData} shape={TeamMarker} />
        </ScatterChart>
      </ResponsiveContainer>
      <TableView data={chartData} />
    </div>
  )
}

function BubbleTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{teamName(d.key)}</div>
      <div className="chart-tooltip-row">Full-Time NHLer: {d.fullTimePct}%</div>
      <div className="chart-tooltip-row">Star: {d.starPct}%</div>
      <div className="chart-tooltip-row">{d.totalPicks} total picks ({d.n} eligible skaters)</div>
    </div>
  )
}

function TableView({ data }) {
  const sorted = [...data].sort((a, b) => b.starPct - a.starPct)
  return (
    <details className="table-view">
      <summary>View as table</summary>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Total picks</th>
            <th>Eligible skaters</th>
            <th>Full-Time NHLer %</th>
            <th>Star %</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => (
            <tr key={d.key}>
              <td>{d.key}</td>
              <td>{d.totalPicks}</td>
              <td>{d.n}</td>
              <td>{d.fullTimePct}%</td>
              <td>{d.starPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
