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

**Elite**, specifically:
- Forwards need a career pace of 0.9+ points per game (roughly 74 points over a full season)
- Defensemen need 0.6+ points per game

Both bars are 1.5x the Star threshold for that position, and both still require the 100-game floor — a hot 10-game stretch doesn't count. This split exists because "Star" alone was too wide a bucket — a very good top-six forward and a generational talent could otherwise land in the same tier.

*Tiers currently cover skaters (forwards and defensemen). Goalie-specific
outcome tracking is planned but not built yet.*

## Still Developing

Players drafted in the last few years haven't had time to reach these
tiers yet, regardless of talent. We flag them as **Still Developing**
rather than counting them as a miss — a pick from the last couple of
draft classes with 0 NHL games so far isn't a bust, they just haven't had
the chance yet.

## 1st Round Bust

A first-round pick who never played a single NHL game, once enough time
has passed for that to be a conclusive outcome rather than a still-developing one.

## Expected value

For any given draft slot, "expected value" is the average production
we'd see if that pick were made over and over across many draft years —
it answers *"if I have pick 20, what should I realistically expect?"*

This includes every bust as a zero, not just the hits — a slot that
occasionally produces a real star but mostly busts still has more
expected value than one that never produces anything, and averaging in
the busts is what keeps this an honest expectation rather than just
"how good are the success stories."

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
