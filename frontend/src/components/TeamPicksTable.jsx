import { useMemo, useState } from 'react'

const COLUMNS = [
  { key: 'draft_year', label: 'Year' },
  { key: 'round', label: 'Rd' },
  { key: 'overall_pick', label: 'Pick' },
  { key: 'player_name', label: 'Player' },
  { key: 'position', label: 'Pos' },
  { key: 'skater_tier_name', label: 'Outcome' },
  { key: 'points_per_game', label: 'PPG' },
]

export function TeamPicksTable({ picks }) {
  const [sortKey, setSortKey] = useState('draft_year')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = useMemo(() => {
    const copy = [...picks]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return a.overall_pick - b.overall_pick
    })
    return copy
  }, [picks, sortKey, sortDir])

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'draft_year' || key === 'points_per_game' ? 'desc' : 'asc')
    }
  }

  return (
    <div className="table-scroll">
      <table className="team-picks-table">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} onClick={() => toggleSort(c.key)} className="sortable-th">
                {c.label}
                {sortKey === c.key && <span className="sort-indicator">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.pick_id}>
              <td>{r.draft_year}</td>
              <td>{r.round}</td>
              <td>{r.overall_pick}</td>
              <td>{r.player_name}</td>
              <td>{r.position || 'N/A'}</td>
              <td>{r.skater_tier_name || (r.position === 'G' ? 'Goalie' : 'N/A')}</td>
              <td>{r.points_per_game ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
