import { pickBucket, positionGroup, eligibleYear, expectedValueByBucket, effectivePts82 } from './pickBucket'

// Per-team aggregate stats across the full dataset, used both for the team
// drill-down and for ranking one team against all others. Independent of any
// UI-level year/position filter -- a team's page should show its whole record.
export function computeTeamStats(rows) {
  const expected = expectedValueByBucket(rows)
  const eligible = eligibleYear()

  const byTeam = new Map()
  for (const r of rows) {
    if (!r.team_abbrev) continue
    if (!byTeam.has(r.team_abbrev)) byTeam.set(r.team_abbrev, [])
    byTeam.get(r.team_abbrev).push(r)
  }

  return Array.from(byTeam.entries()).map(([abbrev, rawPicks]) => {
    // Annotate every pick with its individual value-over-expectation delta
    // (null when not computable: goalies, unmatched picks, or too-recent to
    // be eligible) so consumers -- e.g. a "top steals" list -- don't need to
    // recompute expectedValueByBucket themselves.
    const picks = rawPicks.map((r) => {
      const group = positionGroup(r.position)
      if (r.draft_year > eligible || !group) return { ...r, valueOverExpectation: null }
      const exp = expected.get(`${pickBucket(r)}|${group}`)
      return { ...r, valueOverExpectation: exp ? effectivePts82(r) - exp.expectedPts82 : null }
    })

    const skaterPicks = picks.filter((r) => r.skater_tier !== null && r.skater_tier !== undefined)
    const nhlers = skaterPicks.filter((r) => r.skater_tier >= 1).length
    const meaningful = skaterPicks.filter((r) => r.skater_tier >= 2).length
    const fullTime = skaterPicks.filter((r) => r.skater_tier >= 3).length
    const stars = skaterPicks.filter((r) => r.skater_tier === 4).length
    const elite = skaterPicks.filter((r) => r.is_elite).length
    const hitRate = skaterPicks.length ? (meaningful / skaterPicks.length) * 100 : 0

    const deltas = picks.map((r) => r.valueOverExpectation).filter((d) => d !== null && d !== undefined)
    const avgValueOverExpectation = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null

    const years = picks.map((r) => r.draft_year)
    return {
      abbrev,
      picks,
      totalPicks: picks.length,
      skaterTotal: skaterPicks.length,
      nhlers,
      meaningful,
      fullTime,
      stars,
      elite,
      hitRate,
      avgValueOverExpectation,
      voeN: deltas.length,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    }
  })
}

// Rank helper: 1-indexed rank of `abbrev` among teams with a non-null value
// for `key`, sorted descending (higher is better for every metric used here).
export function rankOf(teamStats, abbrev, key) {
  const ranked = teamStats.filter((t) => t[key] !== null && t[key] !== undefined).sort((a, b) => b[key] - a[key])
  const idx = ranked.findIndex((t) => t.abbrev === abbrev)
  return idx === -1 ? null : { rank: idx + 1, n: ranked.length }
}
