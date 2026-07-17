import { useMemo } from 'react'
import { StatTile } from './StatTile'
import { TeamPicksTable } from './TeamPicksTable'
import { TeamTopFive } from './TeamTopFive'
import { teamName, teamLogoUrl } from '../lib/teamNames'
import { rankOf } from '../lib/teamStats'

export function TeamDetail({ team, teamStats, years, compareTeam }) {
  const [minYear, maxYear] = years
  const yearList = useMemo(() => {
    const list = []
    for (let y = minYear; y <= maxYear; y++) list.push(y)
    return list
  }, [minYear, maxYear])

  const sparklines = useMemo(() => buildSparklines(team.picks, yearList), [team, yearList])

  const hitRateRank = rankOf(teamStats, team.abbrev, 'hitRate')
  const valueRank = rankOf(teamStats, team.abbrev, 'avgValueOverExpectation')

  return (
    <div>
      <div className="chart-card team-detail">
        <div className="player-card-header">
          <img
            src={teamLogoUrl(team.abbrev)}
            alt={team.abbrev}
            className="team-logo-large"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div>
            <h2 className="player-name">{teamName(team.abbrev)}</h2>
            <p className="player-meta">
              {team.totalPicks} picks, {team.minYear}&ndash;{team.maxYear}
            </p>
          </div>
        </div>

        <div className="stat-grid stat-grid-5">
          <StatTile label="Total picks" value={team.totalPicks} sparkline={sparklines.picks} />
          <StatTile label="Reached NHL" value={team.nhlers} sub={pctOfSkaters(team.nhlers, team)} sparkline={sparklines.nhlers} />
          <StatTile label="Full-Time NHLers" value={team.fullTime} sub={pctOfSkaters(team.fullTime, team)} sparkline={sparklines.fullTime} />
          <StatTile label="Stars" value={team.stars} sub={pctOfSkaters(team.stars, team)} sparkline={sparklines.stars} />
          <StatTile label="Elite" value={team.elite} sub={pctOfSkaters(team.elite, team)} sparkline={sparklines.elite} />
        </div>
      </div>

      <TeamTopFive team={team} />

      <div className="chart-card">
        <h3>Where this team ranks</h3>
        <p className="chart-subtitle">
          Value over expectation: actual effective pts/82 minus what a typical pick at that slot/position produces
          (same methodology as the Draft Value tab), averaged across this team's eligible picks
          {team.voeN ? ` (n=${team.voeN})` : ''}. This is the fairer "how good is this team at drafting" number since
          it accounts for draft position, not just raw hit rate.
        </p>
        <div className="stat-grid">
          <StatTile
            label="Value over expectation"
            value={team.avgValueOverExpectation !== null ? `${team.avgValueOverExpectation >= 0 ? '+' : ''}${round1(team.avgValueOverExpectation)} pts/82` : 'N/A'}
            sub={valueRank ? `#${valueRank.rank} of ${valueRank.n}` : 'not enough eligible picks'}
          />
          <StatTile
            label="Hit rate rank"
            value={`${round1(team.hitRate)}%`}
            sub={hitRateRank ? `#${hitRateRank.rank} of ${hitRateRank.n}` : 'N/A'}
          />
        </div>
      </div>

      {compareTeam && (
        <div className="chart-card">
          <h3>{teamName(team.abbrev)} vs. {teamName(compareTeam.abbrev)}</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                <th>{team.abbrev}</th>
                <th>{compareTeam.abbrev}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total picks</td><td>{team.totalPicks}</td><td>{compareTeam.totalPicks}</td></tr>
              <tr><td>Reached NHL</td><td>{team.nhlers}</td><td>{compareTeam.nhlers}</td></tr>
              <tr><td>Full-Time NHLers</td><td>{team.fullTime}</td><td>{compareTeam.fullTime}</td></tr>
              <tr><td>Stars</td><td>{team.stars}</td><td>{compareTeam.stars}</td></tr>
              <tr><td>Elite</td><td>{team.elite}</td><td>{compareTeam.elite}</td></tr>
              <tr><td>Hit rate</td><td>{round1(team.hitRate)}%</td><td>{round1(compareTeam.hitRate)}%</td></tr>
              <tr>
                <td>Value over expectation</td>
                <td>{team.avgValueOverExpectation !== null ? `${team.avgValueOverExpectation >= 0 ? '+' : ''}${round1(team.avgValueOverExpectation)}` : 'N/A'}</td>
                <td>{compareTeam.avgValueOverExpectation !== null ? `${compareTeam.avgValueOverExpectation >= 0 ? '+' : ''}${round1(compareTeam.avgValueOverExpectation)}` : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="chart-card">
        <h3>All picks</h3>
        <TeamPicksTable picks={team.picks} />
      </div>
    </div>
  )
}

function buildSparklines(picks, yearList) {
  const byYear = new Map(yearList.map((y) => [y, []]))
  for (const p of picks) {
    if (byYear.has(p.draft_year)) byYear.get(p.draft_year).push(p)
  }
  const picksPerYear = yearList.map((y) => byYear.get(y).length)
  const nhlersPerYear = yearList.map((y) => byYear.get(y).filter((r) => r.skater_tier >= 1).length)
  const fullTimePerYear = yearList.map((y) => byYear.get(y).filter((r) => r.skater_tier >= 3).length)
  const starsPerYear = yearList.map((y) => byYear.get(y).filter((r) => r.skater_tier === 4).length)
  const elitePerYear = yearList.map((y) => byYear.get(y).filter((r) => r.is_elite).length)
  return {
    picks: picksPerYear,
    nhlers: nhlersPerYear,
    fullTime: fullTimePerYear,
    stars: starsPerYear,
    elite: elitePerYear,
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

// % of this team's skater-eligible picks that reached a given tier --
// same denominator (skaterTotal) the By Team overview tiles already use.
function pctOfSkaters(n, team) {
  if (!team.skaterTotal) return null
  return <span className="stat-tile-sub-dark">{round1((n / team.skaterTotal) * 100)}%</span>
}
