// Bucket boundaries + eligible-year cutoff per EXPECTED_VALUE_METRIC_1.md's SQL
// sketch -- keep in sync with DRAFT_VALUE_FRAMEWORK.md if/when that doc lands.
export const BUCKET_ORDER = [
  'Picks 1-5', 'Picks 6-10', 'Picks 11-15', 'Picks 16-20', 'Picks 21-31',
  'Round 2', 'Round 3', 'Round 4', 'Round 5', 'Round 6', 'Round 7',
]

export function pickBucket(row) {
  if (row.overall_pick <= 5) return 'Picks 1-5'
  if (row.overall_pick <= 10) return 'Picks 6-10'
  if (row.overall_pick <= 15) return 'Picks 11-15'
  if (row.overall_pick <= 20) return 'Picks 16-20'
  if (row.overall_pick <= 31) return 'Picks 21-31'
  return `Round ${row.round}`
}

export function positionGroup(position) {
  if (position === 'C' || position === 'LW' || position === 'RW') return 'Forward'
  if (position === 'D') return 'Defenseman'
  return null
}

export function eligibleYear() {
  return new Date().getFullYear() - 5
}

// Expected effective PPG/pts-per-82, per pick bucket + position group, among
// eligible draft years. Single source of truth so the Draft Value tab and any
// "actual vs. expected" comparison (e.g. team drill-down) use identical numbers.
// Returns a Map keyed `${bucket}|${positionGroup}` -> { expectedPpg, expectedPts82, n }.
export function expectedValueByBucket(rows) {
  const eligible = eligibleYear()
  const groups = new Map()
  for (const r of rows) {
    if (r.draft_year > eligible) continue
    const group = positionGroup(r.position)
    if (!group) continue
    const bucket = pickBucket(r)
    const key = `${bucket}|${group}`
    if (!groups.has(key)) groups.set(key, { sum: 0, n: 0 })
    const effectivePpg = r.is_nhler ? r.points_per_game || 0 : 0
    const g = groups.get(key)
    g.sum += effectivePpg
    g.n += 1
  }
  const result = new Map()
  for (const [key, g] of groups) {
    const expectedPpg = g.n ? g.sum / g.n : 0
    result.set(key, { expectedPpg, expectedPts82: expectedPpg * 82, n: g.n })
  }
  return result
}

// Actual effective pts/82 for a single pick (0 if never a Meaningful NHLer).
export function effectivePts82(row) {
  return (row.is_nhler ? row.points_per_game || 0 : 0) * 82
}
