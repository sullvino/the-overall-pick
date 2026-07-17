import { useEffect, useMemo, useState } from 'react'
import { aggregateBy } from '../lib/aggregate'
import { FilterBar } from '../components/FilterBar'
import { StatTile } from '../components/StatTile'
import { TeamBubbleChart } from '../components/TeamBubbleChart'
import { TeamDetail } from '../components/TeamDetail'
import { computeTeamStats } from '../lib/teamStats'
import { teamName } from '../lib/teamNames'

export function ByTeamTab({ rows, yearRange }) {
  const [filters, setFilters] = useState({ position: 'ALL' })
  const [selectedTeam, setSelectedTeam] = useState('')
  const [compareTeamAbbrev, setCompareTeamAbbrev] = useState('')

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (r.draft_year < yearRange[0] || r.draft_year > yearRange[1]) return false
      if (filters.position !== 'ALL' && r.position !== filters.position) return false
      return true
    })
  }, [rows, filters, yearRange])

  const byTeam = useMemo(() => aggregateBy(filtered, (r) => r.team_abbrev), [filtered])

  // Team drill-down now respects the same year/position filters as the
  // league-wide overview above it -- the whole page reflects one filtered
  // view, not a mix of filtered and unfiltered sections.
  const teamStats = useMemo(() => computeTeamStats(filtered), [filtered])
  const teamAbbrevs = useMemo(() => teamStats.map((t) => t.abbrev).sort((a, b) => teamName(a).localeCompare(teamName(b))), [teamStats])
  const selectedTeamStats = useMemo(() => teamStats.find((t) => t.abbrev === selectedTeam) || null, [teamStats, selectedTeam])
  const compareTeamStats = useMemo(() => teamStats.find((t) => t.abbrev === compareTeamAbbrev) || null, [teamStats, compareTeamAbbrev])

  // Default to the first team alphabetically (Anaheim Ducks) on first load so
  // the drill-down isn't blank -- same concept as Player Cards defaulting to
  // Connor McDavid.
  useEffect(() => {
    if (teamAbbrevs.length > 0 && selectedTeam === '') {
      setSelectedTeam(teamAbbrevs[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamAbbrevs])

  const skaterRows = useMemo(() => filtered.filter((r) => r.skater_tier !== null && r.skater_tier !== undefined), [filtered])
  const totals = useMemo(() => {
    const total = skaterRows.length
    const fullTime = skaterRows.filter((r) => r.skater_tier >= 3).length
    const star = skaterRows.filter((r) => r.skater_tier === 4).length
    const elite = skaterRows.filter((r) => r.is_elite).length
    return { total, fullTime, star, elite }
  }, [skaterRows])

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />

      <section className="stat-grid stat-grid-4">
        <StatTile label="Skaters (eligible for tiers)" value={totals.total.toLocaleString()} />
        <StatTile
          label="Full-Time NHLer+"
          value={totals.fullTime.toLocaleString()}
          sub={pct(totals.fullTime, totals.total) + '%'}
        />
        <StatTile label="Star" value={totals.star.toLocaleString()} sub={pct(totals.star, totals.total) + '%'} />
        <StatTile label="Elite" value={totals.elite.toLocaleString()} sub={pct(totals.elite, totals.total) + '%'} />
      </section>

      <TeamBubbleChart data={byTeam} minSample={5} />

      <h3 className="section-heading">Team drill-down</h3>
      <div className="filter-bar">
        <label className="filter-control">
          <span>Team</span>
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
            <option value="">Select a team&hellip;</option>
            {teamAbbrevs.map((abbrev) => (
              <option key={abbrev} value={abbrev}>
                {teamName(abbrev)}
              </option>
            ))}
          </select>
        </label>
        {selectedTeam && (
          <label className="filter-control">
            <span>Compare to</span>
            <select value={compareTeamAbbrev} onChange={(e) => setCompareTeamAbbrev(e.target.value)}>
              <option value="">None</option>
              {teamAbbrevs
                .filter((abbrev) => abbrev !== selectedTeam)
                .map((abbrev) => (
                  <option key={abbrev} value={abbrev}>
                    {teamName(abbrev)}
                  </option>
                ))}
            </select>
          </label>
        )}
      </div>

      {selectedTeamStats && (
        <TeamDetail team={selectedTeamStats} teamStats={teamStats} years={yearRange} compareTeam={compareTeamStats} />
      )}
    </div>
  )
}

function pct(n, total) {
  if (!total) return '0.0'
  return Math.round((n / total) * 1000) / 10
}
