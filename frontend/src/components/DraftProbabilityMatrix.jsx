import { useMemo } from 'react'
import { BUCKET_ORDER, pickBucket } from '../lib/pickBucket'

const TIERS = [
  { key: 'played', label: 'Played 1 Game', min: 1 },
  { key: 'meaningful', label: 'Meaningful', min: 2 },
  { key: 'fullTime', label: 'Full-Time', min: 3 },
  { key: 'star', label: 'Star', min: 4 },
  { key: 'elite', label: 'Elite', min: 4 },
]

// Same soft champagne-gold ramp as the Draft Table heatmap, for consistency across the app.
const HEAT_STEPS = ['#faf4e6', '#f0e2bc', '#e2c988', '#d1ac57', '#b8903a', '#9c7728']

function heatColor(pct, maxPct) {
  if (pct <= 0) return HEAT_STEPS[0]
  const t = Math.min(1, pct / maxPct)
  const idx = 1 + Math.min(HEAT_STEPS.length - 2, Math.floor(t * (HEAT_STEPS.length - 1)))
  return HEAT_STEPS[idx]
}

function textColorFor(pct, maxPct) {
  if (pct <= 0) return 'var(--text-secondary)'
  const t = Math.min(1, pct / maxPct)
  return t > 0.45 ? '#ffffff' : 'var(--text-primary)'
}

export function DraftProbabilityMatrix({ rows, effectiveMin, effectiveMax }) {
  const data = useMemo(() => {
    const groups = new Map()
    for (const r of rows) {
      if (r.skater_tier === null || r.skater_tier === undefined) continue
      const bucket = pickBucket(r)
      if (!groups.has(bucket)) groups.set(bucket, { total: 0, played: 0, meaningful: 0, fullTime: 0, star: 0, elite: 0 })
      const g = groups.get(bucket)
      g.total += 1
      if (r.skater_tier >= 1) g.played += 1
      if (r.skater_tier >= 2) g.meaningful += 1
      if (r.skater_tier >= 3) g.fullTime += 1
      if (r.skater_tier === 4) g.star += 1
      if (r.is_elite) g.elite += 1
    }
    return BUCKET_ORDER.filter((b) => groups.has(b)).map((bucket) => {
      const g = groups.get(bucket)
      return {
        bucket,
        n: g.total,
        played: round1((g.played / g.total) * 100),
        meaningful: round1((g.meaningful / g.total) * 100),
        fullTime: round1((g.fullTime / g.total) * 100),
        star: round1((g.star / g.total) * 100),
        elite: round1((g.elite / g.total) * 100),
      }
    })
  }, [rows])

  // Heatmap normalized per column, since Played-1-Game and Star live on very different scales.
  const maxByTier = useMemo(() => {
    const max = {}
    for (const t of TIERS) max[t.key] = Math.max(0.1, ...data.map((d) => d[t.key]))
    return max
  }, [data])

  if (data.length === 0) {
    return <p className="chart-empty">Not enough eligible picks yet to compute this.</p>
  }

  return (
    <div className="chart-card">
      <h3>Draft probability matrix</h3>
      <p className="chart-subtitle">
        Share of skater picks reaching each outcome tier, by pick range. Cumulative — "Meaningful" includes
        everyone who also reached Full-Time, Star, or Elite; "Star" includes Elite. Same eligible years (
        {effectiveMin}&ndash;{effectiveMax}) as the chart above. Colored per column (each tier has its own scale).
      </p>
      <div className="table-scroll">
        <table className="prob-matrix">
          <thead>
            <tr>
              <th>Pick range</th>
              {TIERS.map((t) => (
                <th key={t.key}>{t.label}</th>
              ))}
              <th>n</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.bucket}>
                <td className="prob-matrix-row-label">{d.bucket}</td>
                {TIERS.map((t) => (
                  <td
                    key={t.key}
                    style={{ background: heatColor(d[t.key], maxByTier[t.key]), color: textColorFor(d[t.key], maxByTier[t.key]) }}
                  >
                    {d[t.key]}%
                  </td>
                ))}
                <td className="prob-matrix-n">{d.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function round1(n) {
  return Math.round(n * 10) / 10
}
