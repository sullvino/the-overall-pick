# Definitions

How we classify what happened to every drafted player, and how we measure
whether a pick outperformed or underperformed expectations.

## Outcome tiers

Each tier is a strictly higher bar than the one before it — a player who
reaches "Elite" also counts for every tier below it.

| Tier | What it means |
|---|---|
| **Drafted** | Every pick, including those who never signed an NHL contract. |
| **Played 1 NHL Game** | Made an NHL roster at least once, however briefly. |
| **Meaningful NHLer** | 100+ career games played — stuck around, not just a call-up. |
| **Full-Time NHLer** | 200+ career games across 3 or more different seasons — a genuine roster regular. |
| **Star** | Strong production for their position, not just longevity (see below). |
| **Elite** | A step above Star — true top-tier production, not just a solid regular (see below). |

**Star**, specifically:
- Forwards need a career pace of 0.6+ points per game (roughly 50 points over a full season)
- Defensemen need 0.4+ points per game — defensemen top out lower as scorers, so a 0.4 PPG blueliner is a genuine difference-maker
- Also requires the 100-game floor from Meaningful NHLer — a scorching 10-game stretch doesn't count as a Star-level pace

**Elite**, specifically:
- Forwards need a career pace of 0.9+ points per game (roughly 74 points over a full season)
- Defensemen need 0.6+ points per game

Both bars are 1.5x the Star threshold for that position, and both still require the 100-game floor — a hot 10-game stretch doesn't count. This split exists because "Star" alone was too wide a bucket — a very good top-six forward and a generational talent could otherwise land in the same tier.

*Tiers currently cover skaters (forwards and defensemen). Goalie-specific
outcome tracking is planned but not built yet.*

## Still Developing

Players haven't necessarily had time to reach Full-Time NHLer or Star
yet, regardless of talent. We flag them as **Still Developing** rather
than counting them as a miss:

- If a player has debuted, the clock is **4 years from their first NHL
  game**, not their draft day — some prospects (especially defensemen,
  and those developing overseas) don't reach the NHL for several years
  after being drafted, and shouldn't be penalized for years spent before
  they ever got a look. Four years of real NHL opportunity is enough
  time to see whether someone becomes a regular — a full-time role for
  that long is 300+ games, well past the 200-game bar.
- If a player hasn't debuted at all, the clock is **5 years from their
  draft year** instead, since there's no debut to count from yet and a
  longer runway is fair before their first NHL look even happens.

## 1st Round Bust

A first-round pick who never became a Full-Time NHLer or better (Star and
Elite both count, even if they haven't hit the raw games total yet — see
below), once enough time has passed (see Still Developing above) for
that to be a conclusive outcome rather than a still-developing one. A
first-rounder who's stuck around as
a depth/role player but never became a true regular is still a bust —
merely reaching the NHL, or even sticking as a "meaningful" 100-game
player, isn't enough to call a first-round pick a hit.

**Why Star/Elite still count even under 200 games:** a player can be an
elite producer without yet reaching Full-Time NHLer's 200-game floor —
early-career stars often clear the production bar before the raw game
count catches up. We check both paths (Full-Time's game/season
requirement, or Star/Elite's production bar) and only call it a bust if
neither is met.

## Expected value

For any given draft slot, "expected value" is the average production
we'd see if that pick were made over and over across many draft years —
it answers *"if I have pick 20, what should I realistically expect?"*

This includes every player who never played an NHL game as a zero, not
just the hits — a slot that occasionally produces a real star but sees
most of its picks never make the NHL still has more expected value than
one that never produces anything, and averaging in those zeros is what
keeps this an honest expectation rather than just "how good are the
success stories."

Expected value is calculated separately for forwards and defensemen,
since they score at very different rates, and shown as points per 82
games for readability. Very recent draft classes are excluded from this
calculation since they haven't had enough time to prove out yet.

## Value over expectation

Once we know what a draft slot *should* produce, we can compare what a
specific pick actually produced against that baseline:

> **Value over expectation = what this pick actually produced − what picks at this slot typically produce**

A positive number means the pick outperformed similar picks at that
slot; negative means it underperformed. This is a fairer way to judge a
team's drafting than raw hit rate, because it accounts for *where* they
were picking — a team that only picks late in each round will always
have a lower hit rate than one picking in the top 5, even with identical
scouting skill. Value over expectation levels that out.
