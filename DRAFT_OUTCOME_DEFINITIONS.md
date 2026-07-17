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

Any player drafted recently hasn't necessarily had time to reach these
thresholds yet, regardless of talent. Distinct status, separate from
"didn't make it":

- **"Still Developing"** — drafted within the last 5 years AND hasn't yet
  cleared Tier 2 (Meaningful NHLer, 100+ GP). Show this instead of
  counting them as a bust in any outcome-rate calculation. (Widened from
  Tier 1 / 3 years to Tier 2 / 5 years on 2026-07-17 — see below.)
- Everything Tier 2 and above is a real, current outcome regardless of
  draft year — only the *absence* of that outcome needs the "too early to
  tell" caveat.

## Handling "bust" as its own explicit category

**Decided: "1st Round Bust"** — drafted in round 1 AND never reached
Tier 2 (Meaningful NHLer, 100+ GP), with the same "enough time has
passed" caveat from above.

`is_first_round_bust` = `round = 1` AND `career_gp < 100` AND
draft_year is old enough to be conclusive (see "Still Developing" above).

## Bust bar raised from "never played" to "never reached Meaningful NHLer" (2026-07-17)

Original definition (`career_gp = 0`) was too low a bar once the target
audience is specifically round-1 picks. Found while mocking up a piece of
social content ("what does history say about pick 17") that used the old
definition — pick 17 had zero true busts since 2015, which undersold a
much more interesting story underneath it.

**Real numbers that drove the change** — 207 eligible round-1 skater
picks (2015-2021, old 3-year eligibility window): 7 had zero career
games (3.4%), but 39 more played *something* and never reached 100 GP
(18.8%) — invisible to the old definition entirely. A first-rounder who
gets a 15-game cup of coffee and never sticks reads as a bust to any
hockey fan; the old definition was counting him as a non-bust purely
because he "played."

**Fix:** reuse the existing Meaningful NHLer bar (`career_gp >= 100`)
that the tier system already defines and explains — no new number to
justify, and it's the same bar already documented as "stuck around, not
just a call-up." New bust rate: 33/179 conclusive round-1 skaters =
18.4% (using the widened 5-year window below), a far more honest "roughly
1 in 5 first-rounders bust" story than the old 3.4%.

**Also widened the "enough time has passed" window from 3 years to 5**,
to match `eligibleYear()` (the window already used everywhere else in the
app for production judgments — expected value, VOE). Reasoning: proving
"never played a single game" is fast to determine (most players who will
ever play do so within 2-3 pro seasons), but proving "never reached 100
GP" genuinely takes longer — a player bouncing between the NHL/AHL at 60
GP by year 3 could plausibly cross 100 GP by year 4-5 with a full-time
role. Keeping the old 3-year window with the new higher bar risked
prematurely judging players who were still legitimately developing.
`is_still_developing` was updated the same way (GP threshold and window
both), since it's the direct logical complement of `is_first_round_bust`
— even though `is_still_developing` isn't currently read by the frontend,
keeping the pair consistent matters for anyone building against the view
later.

Alternative considered and rejected: splitting into two categories (keep
"1st Round Bust" as the 0-GP case, add a separate "Never Stuck"/"Cup of
Coffee" category for the 1-99 GP case). More nuanced, but adds a new
label and a UI decision (does Team Top Five's Busts panel show one
category or both) for marginal benefit over just moving the existing
line. Revisit if the single-category version turns out to hide
interesting cases.

## Decisions locked in

1. No trophy/awards data required for v1 — Star tier is PPG-based only.
2. "Full-Time NHLer" seasons don't need to be consecutive — any 3 seasons
   across a career count.
3. Bust is defined as **1st Round Bust** specifically (not top-15 or
   broader) — see above. Bar is Meaningful NHLer (100+ GP), not "played at
   least once," as of 2026-07-17.
4. Goalie thresholds are scaled down from skater thresholds (50/150 GP
   instead of 100/200) to reflect lower per-season workload even at full
   NHL establishment. Flagged as the one number worth revisiting once
   real goalie data volume is visible.

