# Value Over Expectation

Companion to `EXPECTED_VALUE_METRIC_1.md` — that doc defines what a pick
*should* produce on average, given its slot and position. This doc defines
how we compare a *specific* pick (or a team's picks collectively) against
that baseline.

## Core definition

For a single drafted player, with `bucket` and `position_group` assigned
the same way as the expected-value metric:

```
actual_pts_82   = effective_ppg(player) * 82
expected_pts_82 = expected_points_per_82(bucket, position_group)   -- from EXPECTED_VALUE_METRIC_1.md

value_over_expectation = actual_pts_82 - expected_pts_82
```

`effective_ppg` is the exact same definition as the expected-value metric
— 0 unless the player cleared 100 career GP. This is deliberate: a player
can't be "above expectation" by way of a 3-game hot streak that wouldn't
count as a real outcome anywhere else in this project.

For a **team** (or any group of picks), the group's value over expectation
is the **average** of the individual deltas across its eligible picks —
not the sum. Averaging keeps the number comparable across teams that made
different numbers of picks; a team with 80 picks and a team with 40 picks
can both be read as "per-pick, how much better or worse than expected."

## Why this is a different question than the expected-value metric

`EXPECTED_VALUE_METRIC_1.md` answers *"if I own pick 20, what should I
expect?"* — a property of the **slot**, aggregated across everyone who's
ever picked there. This doc answers *"given what pick 20 typically
produces, did **this** pick 20 outperform or underperform?"* — a property
of the **individual selection** (or the team/scout who made it).

That second question is the fairer way to grade drafting skill. A team
that only picks in the back half of round 1 will always show a lower raw
hit rate than a team that tanks into the top 5 — that's a function of
draft position, not scouting. Value over expectation nets out draft
position so what's left is closer to "did they beat the field at the
same slot."

## Scope and eligibility

Inherits the expected-value metric's eligible-year window
(`draft_year <= current_year - 5`) on **both sides** of the comparison:

- The **expected** side already excludes recent classes (see
  `EXPECTED_VALUE_METRIC_1.md`) — otherwise the baseline itself would be
  distorted by too-recent, still-developing picks.
- The **actual** side (the specific pick being graded) also has to clear
  the same window. Grading a 2024 pick against a mature expected-value
  baseline would unfairly count them as "below expectation" for not
  having had time to develop yet — that's exactly the miscount
  `DRAFT_OUTCOME_DEFINITIONS.md`'s "Still Developing" status exists to
  prevent, and this metric respects the same guardrail.

Goalies and unmatched/fallback picks are excluded the same way the
expected-value metric excludes them — there's no expected-value baseline
to compare a goalie or an unsigned pick against under this points-based
approach.

## Small-sample caveat

A team or bucket with few eligible picks produces a noisy average — one
outlier pick (a franchise star or a high pick who never played) swings
the number hard. **Always show `n`** (the count of eligible picks behind
the average) alongside the value-over-expectation number, and treat
anything under ~15-20 eligible picks as a small-sample read, not a verdict
on scouting quality. This mirrors the same caveat already applied to the
probability matrix and the expected-value metric.

## Display notes

- Show as `pts/82` with an explicit sign (`+2.1`, `-1.4`) — the sign is
  the entire point of the metric, never let it read ambiguously as a
  plain magnitude.
- Pair with a rank (`#12 of 32`) when comparing across teams, not the raw
  number alone — a `+0.4` can be middling or excellent depending on the
  spread that year, and the rank makes that legible at a glance.
- At the individual-pick level (e.g. a "biggest steals" list), this same
  per-pick delta is what should be sorted on — no separate definition
  needed, it's the same formula, just not averaged into a group.
