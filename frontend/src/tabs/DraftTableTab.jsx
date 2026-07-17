import { useMemo, useState } from 'react'

const ROUNDS = [1, 2, 3, 4, 5, 6, 7]

// Soft champagne-gold ramp (light -> dark): compressed, low-saturation range
// that tops out at a medium-dark gold rather than dark bronze/orange. Single
// hue, near-white at 0. Light-end contrast is intentionally low (near-white
// anchor is meant to read as blank/no-value, not as a visible mark).
const HEAT_STEPS = [
  '#faf4e6', // 0 / no NHL games -- near-white
  '#f0e2bc',
  '#e2c988',
  '#d1ac57',
  '#b8903a',
  '#9c7728', // elite -- medium-dark gold, not brown
]

function heatColor(effectivePpg, maxPpg) {
  if (effectivePpg <= 0) return HEAT_STEPS[0]
  const t = Math.min(1, effectivePpg / maxPpg)
  const idx = 1 + Math.min(HEAT_STEPS.length - 2, Math.floor(t * (HEAT_STEPS.length - 1)))
  return HEAT_STEPS[idx]
}

function textColorFor(effectivePpg, maxPpg) {
  if (effectivePpg <= 0) return 'var(--text-secondary)'
  const t = Math.min(1, effectivePpg / maxPpg)
  return t > 0.45 ? '#ffffff' : 'var(--text-primary)'
}

export function DraftTableTab({ rows, yearRange }) {
  const [round, setRound] = useState(1)
  const [minYear, maxYear] = yearRange

  const yearList = useMemo(() => {
    const list = []
    for (let y = minYear; y <= maxYear; y++) list.push(y)
    return list
  }, [minYear, maxYear])

  const { grid, maxPpg } = useMemo(() => {
    const byYear = new Map()
    for (const y of yearList) byYear.set(y, [])
    for (const r of rows) {
      if (r.round !== round) continue
      if (!byYear.has(r.draft_year)) continue
      byYear.get(r.draft_year).push(r)
    }

    let maxPickInRound = 0
    let maxPpg = 0.1
    const cellMap = new Map()
    for (const y of yearList) {
      const picks = byYear.get(y).slice().sort((a, b) => a.overall_pick - b.overall_pick)
      picks.forEach((r, i) => {
        cellMap.set(`${y}-${i + 1}`, r)
        const effectivePpg = r.is_nhler ? r.points_per_game || 0 : 0
        if (effectivePpg > maxPpg) maxPpg = effectivePpg
      })
      maxPickInRound = Math.max(maxPickInRound, picks.length)
    }

    const grid = []
    for (let p = 1; p <= maxPickInRound; p++) {
      grid.push({ pick: p, cells: yearList.map((y) => cellMap.get(`${y}-${p}`) || null) })
    }
    return { grid, maxPpg }
  }, [rows, round, yearList])

  return (
    <div>
      <div className="filter-bar">
        <label className="filter-control">
          <span>Round</span>
          <select value={round} onChange={(e) => setRound(Number(e.target.value))}>
            {ROUNDS.map((r) => (
              <option key={r} value={r}>
                Round {r}
              </option>
            ))}
          </select>
        </label>
        <div className="heat-legend">
          <span>Bust / never played</span>
          {HEAT_STEPS.map((c, i) => (
            <span key={i} className="heat-swatch" style={{ background: c }} />
          ))}
          <span>Elite production</span>
        </div>
      </div>

      <div className="chart-card draft-table-card">
        <h3>Browse the draft — Round {round}</h3>
        <p className="chart-subtitle">
          Every pick, round by round, year by year — hover a name for their stats. This is the lookup tool; for
          trends and analysis by pick range, see Draft Value. Cell color = points-per-game (0 if never an NHLer).
        </p>
        <div className="draft-table-scroll">
          <table className="draft-table">
            <thead>
              <tr>
                <th className="draft-table-corner">Pick</th>
                {yearList.map((y) => (
                  <th key={y}>{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row) => (
                <tr key={row.pick}>
                  <td className="draft-table-pick">{row.pick}</td>
                  {row.cells.map((cell, i) => {
                    if (!cell) {
                      return <td key={i} className="draft-table-empty" />
                    }
                    const effectivePpg = cell.is_nhler ? cell.points_per_game || 0 : 0
                    return (
                      <td
                        key={i}
                        className="draft-table-cell"
                        style={{ background: heatColor(effectivePpg, maxPpg), color: textColorFor(effectivePpg, maxPpg) }}
                        title={`${cell.player_name} — ${cell.team_abbrev || 'N/A'} — ${
                          cell.games_played ? `${cell.games_played} GP, ${effectivePpg.toFixed(2)} PPG` : 'Never played'
                        }`}
                      >
                        {cell.player_name}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
