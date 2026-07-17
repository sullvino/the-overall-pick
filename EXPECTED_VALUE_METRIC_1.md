# Expected Value Metric (Points-Based)

Replaces the "composite draft value score" placeholder from
`DRAFT_VALUE_FRAMEWORK.md`. This metric answers: "if I have pick N,
what production should I expect, adjusted for both bust risk and
position?"

## Core definition

For each individual drafted player:

```
effective_ppg = career_points / career_gp   IF career_gp >= 100 (the "Meaningful NHLer" threshold)
              = 0                            OTHERWISE
```

Then for a pick-range bucket:

```
expected_ppg          = AVERAGE(effective_ppg) across every pick in the bucket
expected_points_per_82 = expected_ppg * 82
```

## Why it's built this way (not arbitrary — each choice reuses an existing decision)

- **Reuses the 100-GP "Meaningful NHLer" threshold** already locked in
  `DRAFT_OUTCOME_DEFINITIONS.md`, rather than inventing a new cutoff.
  This also solves a real statistical problem: a player who got a 3-game
  call-up and went on a hot streak (e.g. 2 points in 3 games = absurd
  0.67 PPG) would otherwise distort the average. Requiring the games
  threshold before a player's PPG counts filters that noise out.
- **Busts and unsigned picks count as 0, not excluded.** Averaging only
  the players who made it would answer "how good are the hits," which
  overstates every pick range by ignoring how often it misses entirely.
  Including zeroes makes this a true expected-value number: bust risk
  and quality are both baked into one figure, which is what "if I have
  pick 20, what should I expect" actually means.
- **Average, not median, is intentional.** Most late-round buckets would
  median to 0 (most picks bust), which is technically "typical" but
  useless for comparing pick value. Averaging preserves the fact that a
  bucket producing an occasional real star has more expected value than
  one that never does, even if both mostly bust.
- **Points-per-82 for display, not raw PPG.** "A 45-point player" reads
  naturally; "0.55 PPG" doesn't.

## Position split — required, not optional

Forwards and defensemen have fundamentally different scoring baselines,
so this metric must be computed separately for each:

- **Forwards** (`position` IN `C`, `LW`, `RW`)
- **Defensemen** (`position` = `D`)
- **Goalies excluded from this metric entirely** — points-based value
  doesn't apply to them. A separate save-percentage-based expected-value
  metric would need its own definition if wanted later; not in scope here.

## Data scope (reuses decisions from `DRAFT_VALUE_FRAMEWORK.md`)

- Same eligible-year window: `draft_year <= current_year - 5`, so recent
  "still developing" classes don't drag the average toward 0 for players
  who simply haven't had time yet.
- Same pick-range buckets as the probability matrix (Picks 1-5, 6-10,
  11-15, 16-20, 21-31, Round 2 through Round 7) — keeps this metric
  directly comparable side-by-side with the tier-probability matrix.
- Unmatched/fallback picks (`player_id IS NULL`) count as `effective_ppg
  = 0` — they're real busts and must stay in the denominator.

## SQL sketch for reference

```sql
SELECT
    pick_bucket,
    position_group,
    ROUND(AVG(effective_ppg), 3) AS expected_ppg,
    ROUND(AVG(effective_ppg) * 82, 1) AS expected_points_per_82,
    COUNT(*) AS n
FROM (
    SELECT
        CASE
            WHEN overall_pick <= 5 THEN 'Picks 1-5'
            WHEN overall_pick <= 10 THEN 'Picks 6-10'
            WHEN overall_pick <= 15 THEN 'Picks 11-15'
            WHEN overall_pick <= 20 THEN 'Picks 16-20'
            WHEN overall_pick <= 31 THEN 'Picks 21-31'
            ELSE 'Round ' || round
        END AS pick_bucket,
        CASE
            WHEN position IN ('C', 'LW', 'RW') THEN 'Forward'
            WHEN position = 'D' THEN 'Defenseman'
            ELSE NULL
        END AS position_group,
        CASE
            WHEN is_nhler THEN career_points::float / NULLIF(career_gp, 0)
            ELSE 0
        END AS effective_ppg
    FROM v_draft_analysis
    WHERE draft_year <= (EXTRACT(YEAR FROM NOW()) - 5)
) sub
WHERE position_group IS NOT NULL
GROUP BY pick_bucket, position_group
ORDER BY pick_bucket, position_group;
```

(Bucket boundaries and eligible-year cutoff should stay consistent with
whatever was finalized for the probability matrix in
`DRAFT_VALUE_FRAMEWORK.md` — if those change, update both together.)

## Display notes
- Show forward and defenseman numbers side by side per pick bucket, not
  blended.
- Always show `n` (sample size) alongside the expected value — same
  reasoning as the probability matrix.
- Goalies: omit from this table, or show as "N/A — see separate metric"
  rather than leaving a confusing blank.
