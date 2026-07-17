import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BUCKET_ORDER, eligibleYear as getEligibleYear, expectedValueByBucket } from '../lib/pickBucket'
import { DraftProbabilityMatrix } from '../components/DraftProbabilityMatrix'

export function DraftValueTab({ rows, yearRange }) {
  const eligibleYear = getEligibleYear()
  const effectiveMin = yearRange[0]
  const effectiveMax = Math.min(yearRange[1], eligibleYear)
  const clamped = yearRange[1] > eligibleYear

  const eligibleRows = useMemo(
    () => rows.filter((r) => r.draft_year >= effectiveMin && r.draft_year <= effectiveMax),
    [rows, effectiveMin, effectiveMax]
  )

  const chartData = useMemo(() => {
    const expected = expectedValueByBucket(eligibleRows)
    return BUCKET_ORDER.filter((b) => expected.has(`${b}|Forward`) || expected.has(`${b}|Defenseman`)).map((bucket) => {
      const fwd = expected.get(`${bucket}|Forward`)
      const def = expected.get(`${bucket}|Defenseman`)
      return {
        bucket,
        Forward: fwd ? Math.round(fwd.expectedPts82 * 10) / 10 : 0,
        Defenseman: def ? Math.round(def.expectedPts82 * 10) / 10 : 0,
        forwardN: fwd?.n || 0,
        defensemanN: def?.n || 0,
      }
    })
  }, [eligibleRows])

  return (
    <div>
      <div className="chart-card">
        <h3>Draft value — expected points per 82 games</h3>
        <p className="chart-subtitle">
          Average effective PPG × 82, by pick bucket and position. Includes busts as 0 (true expected value, not "how good are the hits").
          Draft years {effectiveMin}&ndash;{effectiveMax}
          {clamped ? ` (clamped from the slider's ${yearRange[0]}–${yearRange[1]} — classes after ${eligibleYear} are excluded, not enough time to be conclusive yet)` : ' (recent classes excluded — not enough time to be conclusive yet)'}.
        </p>
        {effectiveMin > effectiveMax ? (
          <p className="chart-empty">No years in the selected range are old enough to be conclusive yet (need through {eligibleYear} or earlier).</p>
        ) : chartData.length === 0 ? (
          <p className="chart-empty">Not enough eligible picks yet to compute this.</p>
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid stroke="var(--gridline)" vertical={false} />
              <XAxis
                dataKey="bucket"
                stroke="var(--baseline)"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={44} />
              <Tooltip content={<ValueTooltip />} cursor={{ fill: 'var(--gridline)' }} />
              <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 13 }} />
              <Bar dataKey="Forward" fill="var(--gold-dark)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Defenseman" fill="var(--gold)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <TableView data={chartData} />
      </div>

      {effectiveMin <= effectiveMax && (
        <DraftProbabilityMatrix rows={eligibleRows} effectiveMin={effectiveMin} effectiveMax={effectiveMax} />
      )}
    </div>
  )
}

function ValueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{label}</div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-swatch" style={{ background: 'var(--gold-dark)' }} />
        Forward: {d.Forward} pts/82 (n={d.forwardN})
      </div>
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-swatch" style={{ background: 'var(--gold)' }} />
        Defenseman: {d.Defenseman} pts/82 (n={d.defensemanN})
      </div>
    </div>
  )
}

function TableView({ data }) {
  if (data.length === 0) return null
  return (
    <details className="table-view">
      <summary>View as table</summary>
      <table>
        <thead>
          <tr>
            <th>Bucket</th>
            <th>Forward pts/82</th>
            <th>Forward n</th>
            <th>Defenseman pts/82</th>
            <th>Defenseman n</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.bucket}>
              <td>{d.bucket}</td>
              <td>{d.Forward}</td>
              <td>{d.forwardN}</td>
              <td>{d.Defenseman}</td>
              <td>{d.defensemanN}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
