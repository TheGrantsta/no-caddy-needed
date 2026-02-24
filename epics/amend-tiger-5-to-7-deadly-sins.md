# Amend Tiger 5 tally and chart to 7 deadly sins

## Concept

Currently stats being tracked are Tiger 5 that need to be extended to include 'out of position of the tee' and 'penalties' to capture areas for improvement

## The 7 Deadly Sins Stats

1. **3-putts**
2. **Double bogeys**
3. **Bogeys on par 5s**
4. **Bogeys inside 9-iron range**
5. **Double chips**
6. **Trouble off tee**
7. **Penalties**

## Key Decisions

- **Input method:** Live tally during the round — tap to increment each stat as it happens.
- **Persistence:** Store round history in SQLite for viewing trends over time.
- **Navigation:** New section in the existing On Course tab (via SubMenu).
- **Goals/targets:** None — purely tracking occurrences.
- **History detail level:** TBD (per-round totals vs. per-round with course name).

## User Stories

- As a golfer, I want to tap a button to record a 7 Deadly Sins mistake during my round so I can track avoidable errors in real time.
- As a golfer, I want to see my running 7 Deadly Sins for the current round so I know where I stand.
- As a golfer, I want to save my round tally so I can review it later.
- As a golfer, I want to view my 7 Deadly Sins history across past rounds so I can identify trends and recurring mistakes.

## Database Schema Considerations

- Amend SQLite table for Tiger 5 rounds (e.g., `Tiger5Rounds`).
- Columns for each of the seven stats (integer counts per round).
- Timestamp column for when the round was recorded.
- Rename table name to reflect the right name for the table

## UI Placement

- Lives within the **On Course** tab as a new SubMenu section.
- Tally screen shows five labeled counters with tap-to-increment controls.
- History/trends accessible from the same section.

- Any?

## Status

- Incomplete

## Priority

- 100