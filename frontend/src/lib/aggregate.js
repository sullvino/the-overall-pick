function round1(n) {
  return Math.round(n * 10) / 10
}

export function aggregateBy(rows, keyFn) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (key === null || key === undefined || key === '') continue
    if (!groups.has(key)) {
      groups.set(key, {
        key, total: 0, nhler: 0, star: 0, playedOne: 0,
        tierEligible: 0, meaningful: 0, fullTime: 0, tierStar: 0,
      })
    }
    const g = groups.get(key)
    g.total += 1
    if (row.is_nhler) g.nhler += 1
    if (row.is_star) g.star += 1
    if (row.played_one_game) g.playedOne += 1
    if (row.skater_tier !== null && row.skater_tier !== undefined) {
      g.tierEligible += 1
      if (row.skater_tier >= 2) g.meaningful += 1
      if (row.skater_tier >= 3) g.fullTime += 1
      if (row.skater_tier === 4) g.tierStar += 1
    }
  }
  return Array.from(groups.values()).map((g) => ({
    ...g,
    nhlerPct: round1((g.nhler / g.total) * 100),
    starPct: round1((g.star / g.total) * 100),
    playedOnePct: round1((g.playedOne / g.total) * 100),
    meaningfulPct: g.tierEligible ? round1((g.meaningful / g.tierEligible) * 100) : 0,
    fullTimePct: g.tierEligible ? round1((g.fullTime / g.tierEligible) * 100) : 0,
    tierStarPct: g.tierEligible ? round1((g.tierStar / g.tierEligible) * 100) : 0,
  }))
}
