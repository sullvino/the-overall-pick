import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function PlayerSeasonChart({
  seasons,
  leagueAverages,
  positionGroup,
  roundAvg,
  roundLabel,
  compareSeasons,
  comparePlayerName,
}) {
  const leagueBySeasonKey = new Map((leagueAverages || []).filter((l) => l.positionGroup === positionGroup).map((l) => [l.season, l]))

  const seasonKeys = new Set(seasons.filter((s) => s.games_played > 0).map((s) => s.season))
  if (compareSeasons) {
    for (const s of compareSeasons) {
      if (s.games_played > 0) seasonKeys.add(s.season)
    }
  }
  const primaryByKey = new Map(seasons.filter((s) => s.games_played > 0).map((s) => [s.season, s]))
  const compareByKey = new Map((compareSeasons || []).filter((s) => s.games_played > 0).map((s) => [s.season, s]))

  const data = Array.from(seasonKeys)
    .sort()
    .map((key) => {
      const p = primaryByKey.get(key)
      const c = compareByKey.get(key)
      const leagueAvg = leagueBySeasonKey.get(key)
      return {
        season: formatSeason(key),
        ppg: p ? round2(p.points / p.games_played) : null,
        p60: p && p.toi_per_game_sec ? round2((p.points * 3600) / (p.games_played * p.toi_per_game_sec)) : null,
        gp: p ? p.games_played : null,
        goals: p ? p.goals : null,
        assists: p ? p.assists : null,
        comparePpg: c ? round2(c.points / c.games_played) : null,
        compareP60: c && c.toi_per_game_sec ? round2((c.points * 3600) / (c.games_played * c.toi_per_game_sec)) : null,
        compareGp: c ? c.games_played : null,
        leagueAvgPpg: leagueAvg ? round2(leagueAvg.avgPpg) : null,
        leagueAvgP60: leagueAvg ? round2(leagueAvg.avgP60) : null,
        leagueAvgGp: leagueAvg ? round2(leagueAvg.avgGp) : null,
      }
    })

  if (data.length === 0) {
    return <p className="chart-empty">No NHL season data yet.</p>
  }

  return (
    <div className="chart-row">
      <MiniLineChart
        title="Points per game, by season"
        data={data}
        dataKey="ppg"
        compareKey="comparePpg"
        leagueKey="leagueAvgPpg"
        roundAvg={roundAvg?.ppg}
        roundLabel={roundLabel}
        comparePlayerName={comparePlayerName}
        unit="PPG"
      />
      <MiniLineChart
        title="Points per 60 min, by season"
        data={data}
        dataKey="p60"
        compareKey="compareP60"
        leagueKey="leagueAvgP60"
        roundAvg={roundAvg?.p60}
        roundLabel={roundLabel}
        comparePlayerName={comparePlayerName}
        unit="pts/60"
      />
      <MiniLineChart
        title="Games played, by season"
        data={data}
        dataKey="gp"
        compareKey="compareGp"
        leagueKey="leagueAvgGp"
        comparePlayerName={comparePlayerName}
        unit="GP"
      />
      <ScoringSplitChart data={data} />
    </div>
  )
}

// Goals vs. assists for the selected player only -- a scoring-style shape
// over a career, not a vs.-context comparison like the other three charts,
// so no league average / round average / compare-player lines here.
function ScoringSplitChart({ data }) {
  const tooltipRows = [
    { key: 'goals', label: 'Goals', color: 'var(--series-1)' },
    { key: 'assists', label: 'Assists', color: 'var(--series-5)' },
  ]

  return (
    <div className="chart-card">
      <h3>Goals vs. assists, by season</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="season" stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <YAxis stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={36} />
          <Tooltip content={(props) => <SeasonTooltip {...props} rows={tooltipRows} />} cursor={{ stroke: 'var(--gridline)' }} />
          <Legend content={() => <ChartLegend items={tooltipRows} />} />
          <Line type="monotone" dataKey="goals" stroke="var(--series-1)" strokeWidth={2} dot={{ r: 3, fill: 'var(--series-1)' }} connectNulls />
          <Line type="monotone" dataKey="assists" stroke="var(--series-5)" strokeWidth={2} dot={{ r: 3, fill: 'var(--series-5)' }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Gold marks the actual subject of the chart ("This player") so it reads as
// the point of the chart, not just another series -- the two reference lines
// (league avg, round avg) are pushed into muted grays so they recede as
// context instead of competing with the real data for attention.
function MiniLineChart({ title, data, dataKey, compareKey, leagueKey, roundAvg, roundLabel, comparePlayerName, unit }) {
  const legendItems = []
  legendItems.push({ label: 'This player', color: 'var(--gold-dark)' })
  if (comparePlayerName) {
    legendItems.push({ label: comparePlayerName, color: 'var(--series-1)' })
  }
  legendItems.push({ label: `League avg (${unit})`, color: 'var(--text-secondary)' })
  if (roundAvg !== undefined && roundAvg !== null) {
    legendItems.push({ label: roundLabel, color: 'var(--text-muted)' })
  }

  const tooltipRows = [{ key: dataKey, label: 'This player', color: 'var(--gold-dark)', unit }]
  if (comparePlayerName) tooltipRows.push({ key: compareKey, label: comparePlayerName, color: 'var(--series-1)', unit })
  tooltipRows.push({ key: leagueKey, label: 'League avg', color: 'var(--text-secondary)', unit })

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--gridline)" vertical={false} />
          <XAxis dataKey="season" stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
          <YAxis stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={36} />
          <Tooltip content={(props) => <SeasonTooltip {...props} rows={tooltipRows} />} cursor={{ stroke: 'var(--gridline)' }} />
          <Legend content={() => <ChartLegend items={legendItems} />} />
          {roundAvg !== undefined && roundAvg !== null && (
            <ReferenceLine y={roundAvg} stroke="var(--text-muted)" strokeDasharray="2 3" />
          )}
          <Line type="monotone" dataKey={leagueKey} stroke="var(--text-secondary)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
          {comparePlayerName && (
            <Line type="monotone" dataKey={compareKey} stroke="var(--series-1)" strokeWidth={2} dot={{ r: 3, fill: 'var(--series-1)' }} connectNulls />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="var(--gold-dark)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'var(--gold-dark)', stroke: 'var(--surface-1)', strokeWidth: 1.5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function SeasonTooltip({ active, payload, label, rows }) {
  if (!active || !payload?.length) return null
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]))
  const visible = rows.filter((r) => byKey[r.key] !== undefined && byKey[r.key] !== null)
  if (visible.length === 0) return null
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, padding: '8px 10px' }}>
      <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {visible.map((r) => (
        <div key={r.key} style={{ color: r.color }}>
          {r.label}: {byKey[r.key]}
          {r.unit ? ` ${r.unit}` : ''}
        </div>
      ))}
    </div>
  )
}

function ChartLegend({ items }) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <span className="chart-legend-swatch" style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

function formatSeason(season) {
  const s = String(season)
  if (s.length !== 8) return s
  return `${s.slice(0, 4)}-${s.slice(6, 8)}`
}

function round2(n) {
  return Math.round(n * 100) / 100
}
