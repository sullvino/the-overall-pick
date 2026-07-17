function round1(n) {
  return Math.round(n * 10) / 10
}

export function aggregateBy(rows, keyFn) {
  const groups = new Map()
  for (const row of rows) {
    const key = keyFn(row)
    if (key === null || key === undefined || key === '') continue
    if (!groups.has(key)) {
      groups.set(key, { key, total: 0, tierEligible: 0, fullTime: 0, tierStar: 0 })
    }
    const g = groups.get(key)
    g.total += 1
    if (row.skater_tier !== null && row.skater_tier !== undefined) {
      g.tierEligible += 1
      if (row.skater_tier >= 3) g.fullTime += 1
      if (row.skater_tier === 4) g.tierStar += 1
    }
  }
  return Array.from(groups.values()).map((g) => ({
    ...g,
    fullTimePct: g.tierEligible ? round1((g.fullTime / g.tierEligible) * 100) : 0,
    tierStarPct: g.tierEligible ? round1((g.tierStar / g.tierEligible) * 100) : 0,
  }))
}
