import { useEffect, useMemo, useState } from 'react'
import { usePlayerSeasons } from '../hooks/usePlayerSeasons'
import { useAllSeasonStats } from '../hooks/useAllSeasonStats'
import { PlayerSeasonChart } from '../components/PlayerSeasonChart'
import { StatTile } from '../components/StatTile'
import {
  pickBucket,
  positionGroup as getPositionGroup,
  eligibleYear as getEligibleYear,
  expectedValueByBucket,
  effectivePts82,
} from '../lib/pickBucket'

const SKATER_POSITIONS = ['C', 'LW', 'RW', 'D']

export function PlayerCardTab({ rows }) {
  const [query, setQuery] = useState('')
  const [selectedPickId, setSelectedPickId] = useState(null)
  const [compareQuery, setCompareQuery] = useState('')
  const [comparePickId, setComparePickId] = useState(null)

  // Default to Connor McDavid on first load so the tab isn't blank -- doesn't
  // touch the search box, so it still shows its normal empty placeholder.
  useEffect(() => {
    if (rows.length > 0 && selectedPickId === null) {
      const mcdavid = rows.find((r) => r.player_name === 'Connor McDavid')
      if (mcdavid) setSelectedPickId(mcdavid.pick_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return rows
      .filter((r) => r.player_name?.toLowerCase().includes(q))
      .sort((a, b) => a.draft_year - b.draft_year || a.overall_pick - b.overall_pick)
      .slice(0, 12)
  }, [rows, query])

  const compareMatches = useMemo(() => {
    const q = compareQuery.trim().toLowerCase()
    if (q.length < 2) return []
    return rows
      .filter((r) => r.player_name?.toLowerCase().includes(q) && SKATER_POSITIONS.includes(r.position) && r.pick_id !== selectedPickId)
      .sort((a, b) => a.draft_year - b.draft_year || a.overall_pick - b.overall_pick)
      .slice(0, 12)
  }, [rows, compareQuery, selectedPickId])

  const player = useMemo(() => rows.find((r) => r.pick_id === selectedPickId) || null, [rows, selectedPickId])
  const comparePlayer = useMemo(
    () => (comparePickId && comparePickId !== selectedPickId ? rows.find((r) => r.pick_id === comparePickId) || null : null),
    [rows, comparePickId, selectedPickId]
  )

  const { seasons } = usePlayerSeasons(player?.player_id)
  const { seasons: compareSeasons } = usePlayerSeasons(comparePlayer?.player_id)
  const allSeasonStats = useAllSeasonStats()

  const isSkater = player && SKATER_POSITIONS.includes(player.position)
  const playerPositionGroup = player ? getPositionGroup(player.position) : null

  // player_id -> position group, for joining raw season rows to Forward/Defenseman.
  const positionByPlayerId = useMemo(() => {
    const map = new Map()
    for (const r of rows) {
      if (r.player_id) map.set(r.player_id, getPositionGroup(r.position))
    }
    return map
  }, [rows])

  // League average PPG/P60 per season, split Forward vs Defenseman. Computed
  // once (independent of the selected player) from every skater's season rows.
  const leagueAverages = useMemo(() => {
    if (!allSeasonStats) return []
    const groups = new Map() // `${season}|${positionGroup}` -> {ppgSum, p60Sum, n}
    for (const s of allSeasonStats) {
      if (!s.games_played) continue
      const group = positionByPlayerId.get(s.player_id)
      if (!group) continue
      const key = `${s.season}|${group}`
      if (!groups.has(key)) groups.set(key, { season: s.season, positionGroup: group, ppgSum: 0, p60Sum: 0, p60N: 0, n: 0 })
      const g = groups.get(key)
      g.ppgSum += s.points / s.games_played
      g.n += 1
      if (s.toi_per_game_sec) {
        g.p60Sum += (s.points * 3600) / (s.games_played * s.toi_per_game_sec)
        g.p60N += 1
      }
    }
    return Array.from(groups.values()).map((g) => ({
      season: g.season,
      positionGroup: g.positionGroup,
      avgPpg: g.ppgSum / g.n,
      avgP60: g.p60N ? g.p60Sum / g.p60N : null,
    }))
  }, [allSeasonStats, positionByPlayerId])

  // Historical average career PPG/P60 for skaters drafted in the same
  // round + position group who actually reached the NHL (is_nhler).
  const roundAvg = useMemo(() => {
    if (!player || !isSkater) return null
    const peers = rows.filter(
      (r) => r.round === player.round && getPositionGroup(r.position) === playerPositionGroup && r.is_nhler
    )
    if (peers.length === 0) return null
    const ppgSum = peers.reduce((sum, r) => sum + (r.points_per_game || 0), 0)
    const p60Values = peers
      .filter((r) => r.games_played && r.avg_toi_seconds)
      .map((r) => (r.points * 3600) / (r.games_played * r.avg_toi_seconds))
    return {
      ppg: round2(ppgSum / peers.length),
      p60: p60Values.length ? round2(p60Values.reduce((a, b) => a + b, 0) / p60Values.length) : null,
      n: peers.length,
    }
  }, [player, isSkater, playerPositionGroup, rows])

  const percentiles = useMemo(() => {
    if (!player || !isSkater) return null
    const effectivePpg = player.is_nhler ? player.points_per_game || 0 : 0
    const bucket = pickBucket(player)
    const ppgOf = (r) => (r.is_nhler ? r.points_per_game || 0 : 0)

    const skaterRows = rows.filter((r) => r.skater_tier !== null && r.skater_tier !== undefined)
    const overallBelow = skaterRows.filter((r) => ppgOf(r) < effectivePpg).length
    const overallAbove = skaterRows.filter((r) => ppgOf(r) > effectivePpg).length
    // Keep full precision here -- rounding this to 1 decimal before subtracting
    // from 100 can round a genuine #1 finish (e.g. 99.953%) up to a hard 100.0,
    // which then displays as "top 0%" instead of "top <0.1%".
    const overallTopPct = 100 - (overallBelow / skaterRows.length) * 100

    const bucketRows = skaterRows.filter((r) => pickBucket(r) === bucket)
    const bucketBelow = bucketRows.filter((r) => ppgOf(r) < effectivePpg).length
    const bucketAbove = bucketRows.filter((r) => ppgOf(r) > effectivePpg).length
    const bucketTopPct = 100 - (bucketBelow / bucketRows.length) * 100

    return {
      overallTopPct,
      bucketTopPct,
      bucket,
      effectivePpg,
      overallRank: overallAbove + 1,
      overallN: skaterRows.length,
      bucketRank: bucketAbove + 1,
      bucketN: bucketRows.length,
    }
  }, [player, isSkater, rows])

  // Same eligible-year clamp as the Draft Value tab / team drill-down -- a pick
  // from a too-recent draft class can't be judged against expectation yet.
  const pickValueOverExpectation = useMemo(() => {
    if (!player || !isSkater || player.draft_year > getEligibleYear()) return null
    const expected = expectedValueByBucket(rows)
    const exp = expected.get(`${pickBucket(player)}|${playerPositionGroup}`)
    if (!exp) return null
    return effectivePts82(player) - exp.expectedPts82
  }, [player, isSkater, playerPositionGroup, rows])

  const careerP60 = useMemo(() => {
    if (!player || !player.games_played || !player.avg_toi_seconds) return null
    return round2((player.points * 3600) / (player.games_played * player.avg_toi_seconds))
  }, [player])

  // Season-level arrays, for the KPI-tile sparklines (same math as the chart below).
  const sparklines = useMemo(() => {
    if (!seasons) return { gp: [], goals: [], assists: [], ppg: [], p60: [] }
    const played = seasons.filter((s) => s.games_played > 0)
    return {
      gp: played.map((s) => s.games_played),
      goals: played.map((s) => s.goals),
      assists: played.map((s) => s.assists),
      ppg: played.map((s) => s.points / s.games_played),
      p60: played.map((s) => (s.toi_per_game_sec ? (s.points * 3600) / (s.games_played * s.toi_per_game_sec) : null)),
    }
  }, [seasons])

  return (
    <div>
      <div className="chart-card">
        <h3>Search for a player</h3>
        <input
          type="text"
          className="player-search"
          placeholder="e.g. Connor McDavid"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {matches.length > 0 && (
          <ul className="player-search-results">
            {matches.map((r) => (
              <li key={r.pick_id}>
                <button
                  onClick={() => {
                    setSelectedPickId(r.pick_id)
                    setQuery(r.player_name)
                  }}
                >
                  {r.player_name}
                  <span className="player-search-meta">
                    {r.draft_year} · Round {r.round}, #{r.overall_pick} · {r.team_abbrev || 'N/A'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {player && (
        <>
          <div className="chart-card player-card">
            <div className="player-card-header">
              {player.headshot_url ? (
                <img src={player.headshot_url} alt={player.player_name} className="player-headshot" />
              ) : (
                <div className="player-headshot player-headshot-placeholder" />
              )}
              <div>
                <h2 className="player-name">{player.player_name}</h2>
                <p className="player-meta">
                  {player.team_abbrev && (
                    <img
                      src={teamLogoUrl(player.team_abbrev)}
                      alt={player.team_abbrev}
                      className="team-logo-inline"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  {player.position || 'N/A'} · Drafted {player.draft_year}, Round {player.round} (#{player.overall_pick} overall) by{' '}
                  {player.team_abbrev || 'N/A'}
                </p>
                {(player.drafted_from_team_name || player.amateur_league) && (
                  <p className="player-meta">
                    Drafted from: {player.drafted_from_team_name || 'N/A'}
                    {player.amateur_league ? ` (${player.amateur_league})` : ''}
                  </p>
                )}
                {player.skater_tier_name && <p className="player-meta">Outcome tier: {player.skater_tier_name}</p>}
              </div>
            </div>

            {(player.birth_date || player.height_cm || player.weight_kg || player.shoots_catches) && (
              <div className="bio-row">
                {player.birth_date && (
                  <div className="bio-item">
                    <span className="bio-label">Age at draft</span>
                    <span>{ageAtDraft(player.birth_date, player.draft_year)}</span>
                  </div>
                )}
                {(player.birth_city || player.birth_state_province || player.birth_country) && (
                  <div className="bio-item">
                    <span className="bio-label">Birthplace</span>
                    <span>{formatBirthplace(player)}</span>
                  </div>
                )}
                {player.height_cm && (
                  <div className="bio-item">
                    <span className="bio-label">Height</span>
                    <span>{formatHeight(player.height_cm)}</span>
                  </div>
                )}
                {player.weight_kg && (
                  <div className="bio-item">
                    <span className="bio-label">Weight</span>
                    <span>{formatWeight(player.weight_kg)}</span>
                  </div>
                )}
                {player.shoots_catches && (
                  <div className="bio-item">
                    <span className="bio-label">{player.position === 'G' ? 'Catches' : 'Shoots'}</span>
                    <span>{player.shoots_catches}</span>
                  </div>
                )}
              </div>
            )}

            <div className="stat-grid player-stat-grid">
              <StatTile label="Career GP" value={player.games_played?.toLocaleString() ?? '—'} sparkline={isSkater ? sparklines.gp : undefined} />
              <StatTile label="Career Goals" value={player.goals?.toLocaleString() ?? '—'} sparkline={isSkater ? sparklines.goals : undefined} />
              <StatTile label="Career Assists" value={player.assists?.toLocaleString() ?? '—'} sparkline={isSkater ? sparklines.assists : undefined} />
              <StatTile
                label="Career PPG"
                value={isSkater ? player.points_per_game ?? '—' : 'N/A'}
                sparkline={isSkater ? sparklines.ppg : undefined}
              />
              <StatTile
                label="Career pts/60"
                value={isSkater ? careerP60 ?? '—' : 'N/A'}
                sub={isSkater ? 'normalized to 60 min TOI' : 'skaters only'}
                sparkline={isSkater ? sparklines.p60 : undefined}
              />
            </div>
          </div>

          {isSkater && percentiles && (
            <div className="chart-card">
              <h3>Where this pick ranks</h3>
              <p className="chart-subtitle">
                Effective PPG vs. every drafted skater — "effective" means a player's real career PPG only if they
                cleared 100 career GP (the Meaningful NHLer bar); otherwise it counts as 0, whether they never played
                or just haven't logged enough games for their rate to be reliable.
              </p>
              <div className="stat-grid">
                <StatTile
                  label="Vs. all drafted skaters"
                  value={`Top ${formatTopPct(percentiles.overallTopPct)}`}
                  sub={`#${percentiles.overallRank} of ${percentiles.overallN}`}
                />
                <StatTile
                  label={`Vs. ${percentiles.bucket}`}
                  value={`Top ${formatTopPct(percentiles.bucketTopPct)}`}
                  sub={`#${percentiles.bucketRank} of ${percentiles.bucketN}`}
                />
                <StatTile
                  label="Value over expectation"
                  value={
                    pickValueOverExpectation !== null
                      ? `${pickValueOverExpectation >= 0 ? '+' : ''}${round1(pickValueOverExpectation)} pts/82`
                      : 'Still developing'
                  }
                  sub={pickValueOverExpectation !== null ? 'vs. typical pick at this slot' : 'not enough NHL seasons yet'}
                  tone={pickValueOverExpectation === null ? undefined : pickValueOverExpectation >= 0 ? 'good' : 'bad'}
                />
              </div>
            </div>
          )}

          {isSkater && (
            <>
              <h3 className="section-heading">Career trend</h3>
              <p className="chart-subtitle">
                Dashed line: league average for {pluralPosition(playerPositionGroup)} that season, computed from the
                drafted players in this database (not the full league). Dotted flat line: historical average for{' '}
                {pluralPosition(playerPositionGroup)} drafted in Round {player.round} who reached the NHL
                {roundAvg ? ` (n=${roundAvg.n})` : ''}.
              </p>

              <div className="compare-search">
                <input
                  type="text"
                  className="player-search"
                  placeholder="Compare to another skater&hellip;"
                  value={compareQuery}
                  onChange={(e) => setCompareQuery(e.target.value)}
                />
                {comparePlayer && (
                  <button className="compare-clear" onClick={() => { setComparePickId(null); setCompareQuery('') }}>
                    Clear compare (&times; {comparePlayer.player_name})
                  </button>
                )}
                {compareMatches.length > 0 && (
                  <ul className="player-search-results">
                    {compareMatches.map((r) => (
                      <li key={r.pick_id}>
                        <button
                          onClick={() => {
                            setComparePickId(r.pick_id)
                            setCompareQuery(r.player_name)
                          }}
                        >
                          {r.player_name}
                          <span className="player-search-meta">
                            {r.draft_year} · Round {r.round}, #{r.overall_pick} · {r.team_abbrev || 'N/A'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {seasons === null || !allSeasonStats ? (
                <p className="chart-empty">Loading season data&hellip;</p>
              ) : (
                <PlayerSeasonChart
                  seasons={seasons}
                  leagueAverages={leagueAverages}
                  positionGroup={playerPositionGroup}
                  roundAvg={roundAvg}
                  roundLabel={`Round ${player.round} ${playerPositionGroup}`}
                  compareSeasons={comparePlayer ? compareSeasons : null}
                  comparePlayerName={comparePlayer?.player_name}
                />
              )}
            </>
          )}

          {!isSkater && (
            <p className="chart-footnote">
              {player.position === 'G'
                ? 'Goalie-specific stats (wins, save %, GAA) aren’t tracked yet — this card shows the base stats only.'
                : "This pick was never matched to an NHL player record, so position and career stats aren't available."}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function formatTopPct(n) {
  if (n > 0 && n < 0.1) return '<0.1%'
  return `${round1(n)}%`
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function pluralPosition(group) {
  return group === 'Defenseman' ? 'Defensemen' : `${group}s`
}

function teamLogoUrl(abbrev) {
  return `https://assets.nhle.com/logos/nhl/svg/${abbrev}_light.svg`
}

function ageAtDraft(birthDate, draftYear) {
  const birth = new Date(birthDate)
  // Draft day is late June; approximate with June 30 of the draft year.
  const draftDay = new Date(Date.UTC(draftYear, 5, 30))
  let age = draftDay.getUTCFullYear() - birth.getUTCFullYear()
  const hasHadBirthday =
    draftDay.getUTCMonth() > birth.getUTCMonth() ||
    (draftDay.getUTCMonth() === birth.getUTCMonth() && draftDay.getUTCDate() >= birth.getUTCDate())
  if (!hasHadBirthday) age -= 1
  return `${age}`
}

function formatBirthplace(player) {
  return [player.birth_city, player.birth_state_province, player.birth_country].filter(Boolean).join(', ')
}

function formatHeight(cm) {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${cm} cm (${feet}'${inches}")`
}

function formatWeight(kg) {
  const lbs = Math.round(kg * 2.20462)
  return `${kg} kg (${lbs} lbs)`
}
