# Draft Outcome Definitions

A tiered framework for classifying what happened to a drafted player. Each
tier is a strictly higher bar than the one before it — a player who
qualifies for "Star" also qualifies for everything below it.

## The tiers

| Tier | Name | Threshold | What it captures |
|---|---|---|---|
| 0 | **Drafted** | Baseline — every pick | The full denominator, including picks who never signed |
| 1 | **Played 1 NHL Game** | `career_gp >= 1` | "Cup of coffee" — made an NHL roster at least once, however briefly |
| 2 | **Meaningful NHLer** | Skaters: `career_gp >= 100`. Goalies: `career_gp >= 50` | Stuck around — not just a call-up |
| 3 | **Full-Time NHLer** | Skaters: `career_gp >= 200` + 3 distinct seasons. Goalies: `career_gp >= 150` + 3 distinct seasons | A genuine roster regular |
| 4 | **Star** | Position-adjusted — see below | Strong production, not just longevity |
| 4+ | **Elite** (`is_elite` flag) | Position-adjusted, 1.5x the Star PPG bar — see below | True top-tier production, not just a solid regular. Additive boolean, not a new numeric tier -- `skater_tier` stays 0-4, `skater_tier_name` displays "Elite" in place of "Star" when the flag is true |

**Decided: no trophy/awards-voting tier for v1.** An "Elite/Franchise"
tier above Star could be added later if that data gets sourced, but
definitions here don't depend on it.

## Why goalie thresholds are lower than skaters'

A legitimate NHL backup goalie might only get 20-25 starts in a season
while being fully established at the NHL level — very different from a
skater, where even a 4th-liner plays close to a full 82-game slate if
they're on the roster. Using the skater thresholds for goalies would
understate them (a career backup could take 8+ years to hit 200 GP).
Scaled down instead: 50 GP for "Meaningful," 150 GP for "Full-Time."

**Caveat:** far fewer goalies get drafted per year than skaters, so these
numbers are more sensitive to small-sample noise. Worth revisiting once
you can see the actual goalie distribution in your data rather than
trusting this estimate blind.

## Why 100 games for "Meaningful NHLer," not just 1

Games ≥1 catches players who got a single injury-replacement call-up and
never returned — that's a real outcome, but it's not what most people mean
by "made it." 100 GP is a commonly used line in public draft-analysis
work because it roughly filters out cameo appearances while still being a
low enough bar that even a decent 4th-liner clears it within 2 seasons.

## Why "Full-Time NHLer" needs a season-count condition, not just total GP

Raw career GP alone can be misleading: a player who racked up 200 games in
two injury-shortened seasons because their team was desperate reads very
differently from one who's been a steady lineup regular for 4+ years.
Requiring games spread across 3+ distinct seasons filters out compressed,
one-off usage.

## Star tier needs to be position-adjusted — this is the important one

A flat points-per-game cutoff overrates defensemen's floor and underrates
forwards' bar, and doesn't work for goalies at all. Suggested split:

- **Forwards:** career PPG ≥ 0.6 (roughly a 50-point-per-82-game pace)
- **Defensemen:** career PPG ≥ 0.4 (defensemen top out lower — a 0.4 PPG
  defenseman is a genuine offensive difference-maker)
- **Goalies:** career save % ≥ .915 AND 150+ games played (needs its own
  track entirely — points-based metrics don't apply)

All three still require clearing the "Meaningful NHLer" games threshold
first, so a small-sample hot streak doesn't get miscounted as a star.

## Elite: Star was too wide a bucket (added 2026-07-16)

Real gap found in the actual data: sorting every current Star-tier skater
by career PPG, there's a visible cliff — 14 forwards cluster from 0.927
(Bedard) up to 1.537 (McDavid), then drop to 0.886 (Suzuki) and a long
tail down to the 0.6 floor. Same shape for defensemen: 8 cluster from
0.63 (McAvoy) to 1.08 (Makar), then a drop to 0.627 (Heiskanen) and a
tail to 0.4. Gabriel Vilardi (0.693 PPG) and Connor McDavid (1.537 PPG)
were landing in the same "Star" bucket, which undersells the gap between
a very good top-six forward and a generational talent.

**Elite thresholds — exactly 1.5x the Star PPG bar for that position:**
- Forwards: career PPG ≥ 0.9 (~74 points over 82 games)
- Defensemen: career PPG ≥ 0.6
- Same 100-GP floor as Star (already satisfied by construction, since
  Elite is a subset of the Star population)
- Goalies: not defined yet, same as Star (goalie tiers aren't built)

**Implementation: additive, not a new numeric tier.** `skater_tier` stays
0-4 (nothing that filters `skater_tier >= 4` or `skater_tier === 4`
changes behavior — Elite players are still tier 4). Added a new
`is_elite` boolean column instead, and `skater_tier_name` now returns
"Elite" instead of "Star" for players who clear it. Verified safe: every
consumer of the star count (`ByTeamTab`, `DraftProbabilityMatrix`,
`teamStats.js`) filters on the numeric `skater_tier`, not the string —
only `PlayerCardTab` and `TeamPicksTable` print the literal
`skater_tier_name`, and both want the "Elite" label to show up.

Dropped the old `is_star` column in the same migration — it was a
leftover flat `games>=100 AND ppg>=0.6` check with no position
adjustment (wrong for defensemen), and nothing in the frontend read it;
confirmed via grep before dropping.

## Handling recent draft years — don't let this get miscounted as "bust"

Any player drafted in the last ~3-4 years hasn't had time to reach these
thresholds yet, regardless of talent. Recommend a distinct status,
separate from "didn't make it":

- **"Still Developing"** — drafted within the last N years (suggest N=4)
  AND hasn't yet cleared Tier 1. Show this instead of counting them as a
  bust in any outcome-rate calculation.
- Everything Tier 1 and above is a real, current outcome regardless of
  draft year — only the *absence* of an outcome needs the "too early to
  tell" caveat.

## Handling "bust" as its own explicit category

**Decided: "1st Round Bust"** — drafted in round 1 AND never reached
Tier 1 (Played 1 NHL Game), with the same "enough time has passed" caveat
from above (don't flag a 2023-2025 first-rounder as a bust yet — they may
just still be developing).

`is_first_round_bust` = `round = 1` AND `career_gp` is NULL/0 AND
draft_year is old enough to be conclusive (see "Still Developing" above).

## Decisions locked in

1. No trophy/awards data required for v1 — Star tier is PPG-based only.
2. "Full-Time NHLer" seasons don't need to be consecutive — any 3 seasons
   across a career count.
3. Bust is defined as **1st Round Bust** specifically (not top-15 or
   broader) — see above.
4. Goalie thresholds are scaled down from skater thresholds (50/150 GP
   instead of 100/200) to reflect lower per-season workload even at full
   NHL establishment. Flagged as the one number worth revisiting once
   real goalie data volume is visible.

