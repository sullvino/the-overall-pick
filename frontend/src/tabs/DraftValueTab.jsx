import { useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BUCKET_ORDER, eligibleYear as getEligibleYear, expectedValueByBucket } from '../lib/pickBucket'
import { DraftProbabilityMatrix } from '../components/DraftProbabilityMatrix'
import { DraftValueHeatmap } from '../components/DraftValueHeatmap'
import { TEAM_NAMES, teamName } from '../lib/teamNames'

const TEAM_ABBREVS = Object.keys(TEAM_NAMES).sort((a, b) => TEAM_NAMES[a].localeCompare(TEAM_NAMES[b]))

function possessive(name) {
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}

export function DraftValueTab({ rows, yearRange }) {
  const [selectedTeam, setSelectedTeam] = useState('')
  const eligibleYear = getEligibleYear()
  const effectiveMin = yearRange[0]
  const effectiveMax = Math.min(yearRange[1], eligibleYear)
  const clamped = yearRange[1] > eligibleYear

  const eligibleRows = useMemo(
    () => rows.filter((r) => r.draft_year >= effectiveMin && r.draft_year <= effectiveMax),
    [rows, effectiveMin, effectiveMax]
  )

  // Team overlay: that team's own actual pts/82 by bucket, using the exact
  // same methodology as the league baseline (expectedValueByBucket), just
  // scoped to one team's picks -- this is Value Over Expectation visualized
  // as a chart instead of one summary number on the Teams page.
  const teamActual = useMemo(() => {
    if (!selectedTeam) return new Map()
    return expectedValueByBucket(eligibleRows.filter((r) => r.team_abbrev === selectedTeam))
  }, [eligibleRows, selectedTeam])

  const chartData = useMemo(() => {
    const expected = expectedValueByBucket(eligibleRows)
    return BUCKET_ORDER.filter((b) => expected.has(`${b}|Forward`) || expected.has(`${b}|Defenseman`)).map((bucket) => {
      const fwd = expected.get(`${bucket}|Forward`)
      const def = expected.get(`${bucket}|Defenseman`)
      const teamFwd = teamActual.get(`${bucket}|Forward`)
      const teamDef = teamActual.get(`${bucket}|Defenseman`)
      return {
        bucket,
        Forward: fwd ? Math.round(fwd.expectedPts82 * 10) / 10 : 0,
        Defenseman: def ? Math.round(def.expectedPts82 * 10) / 10 : 0,
        forwardN: fwd?.n || 0,
        defensemanN: def?.n || 0,
        TeamForward: teamFwd ? Math.round(teamFwd.expectedPts82 * 10) / 10 : null,
        TeamDefenseman: teamDef ? Math.round(teamDef.expectedPts82 * 10) / 10 : null,
        teamForwardN: teamFwd?.n || 0,
        teamDefensemanN: teamDef?.n || 0,
      }
    })
  }, [eligibleRows, teamActual])

  return (
    <div>
      <div className="chart-card">
        <h3>Draft value — expected points per 82 games</h3>
        <p className="chart-subtitle">
          Average effective PPG × 82, by pick bucket and position. Includes players who never played an NHL game as 0 (true expected value, not just how good the ones who made it were).
          Draft years {effectiveMin}&ndash;{effectiveMax}
          {clamped ? ` (clamped from the slider's ${yearRange[0]}–${yearRange[1]} — classes after ${eligibleYear} are excluded, not enough time to be conclusive yet)` : ' (recent classes excluded — not enough time to be conclusive yet)'}.
          {selectedTeam ? ` Lines show ${possessive(teamName(selectedTeam))} own actual pts/82 per bucket, against the league baseline.` : ''}
        </p>

        <div className="filter-bar">
          <label className="filter-control">
            <span>Compare a team to the baseline</span>
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
              <option value="">League baseline only</option>
              {TEAM_ABBREVS.map((abbrev) => (
                <option key={abbrev} value={abbrev}>
                  {teamName(abbrev)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {effectiveMin > effectiveMax ? (
          <p className="chart-empty">No years in the selected range are old enough to be conclusive yet (need through {eligibleYear} or earlier).</p>
        ) : chartData.length === 0 ? (
          <p className="chart-empty">Not enough eligible picks yet to compute this.</p>
        ) : (
          <div className="value-heatmap-chart-grid">
            <DraftValueHeatmap data={chartData} />
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="var(--gridline)" horizontal={false} />
                <XAxis type="number" stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis type="category" dataKey="bucket" stroke="var(--baseline)" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={90} />
                <Tooltip content={<ValueTooltip selectedTeam={selectedTeam} />} cursor={{ fill: 'var(--gridline)' }} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                <Bar dataKey="Forward" fill="var(--gold-dark)" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false} />
                <Bar dataKey="Defenseman" fill="var(--gold)" radius={[0, 4, 4, 0]} barSize={14} isAnimationActive={false} />
                {selectedTeam && (
                  <Line
                    dataKey="TeamForward"
                    name={`${selectedTeam} Forward`}
                    stroke="var(--series-1)"
                    strokeWidth={0}
                    legendType="circle"
                    dot={{ r: 5, fill: 'var(--series-1)', stroke: 'var(--surface-1)', strokeWidth: 1.5 }}
                    isAnimationActive={false}
                  />
                )}
                {selectedTeam && (
                  <Line
                    dataKey="TeamDefenseman"
                    name={`${selectedTeam} Defenseman`}
                    stroke="var(--series-5)"
                    strokeWidth={0}
                    legendType="circle"
                    dot={{ r: 5, fill: 'var(--series-5)', stroke: 'var(--surface-1)', strokeWidth: 1.5 }}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <TableView data={chartData} selectedTeam={selectedTeam} />
      </div>

      {effectiveMin <= effectiveMax && (
        <DraftProbabilityMatrix rows={eligibleRows} effectiveMin={effectiveMin} effectiveMax={effectiveMax} />
      )}
    </div>
  )
}

function ValueTooltip({ active, payload, label, selectedTeam }) {
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
      {selectedTeam && (
        <>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-swatch" style={{ background: 'var(--series-1)' }} />
            {selectedTeam} Forward: {d.TeamForward ?? 'N/A'} pts/82{d.teamForwardN ? ` (n=${d.teamForwardN})` : ''}
          </div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-swatch" style={{ background: 'var(--series-5)' }} />
            {selectedTeam} Defenseman: {d.TeamDefenseman ?? 'N/A'} pts/82{d.teamDefensemanN ? ` (n=${d.teamDefensemanN})` : ''}
          </div>
        </>
      )}
    </div>
  )
}

function TableView({ data, selectedTeam }) {
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
            {selectedTeam && (
              <>
                <th>{selectedTeam} Forward pts/82</th>
                <th>{selectedTeam} Defenseman pts/82</th>
              </>
            )}
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
              {selectedTeam && (
                <>
                  <td>{d.TeamForward ?? 'N/A'}</td>
                  <td>{d.TeamDefenseman ?? 'N/A'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
