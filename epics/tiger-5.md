# Tiger 5 — On-Course Stat Tracking

## Concept

Track five avoidable scoring mistakes during a round to identify leaks and lower scores. The Tiger 5 provides a simple, focused framework for recognizing patterns that cost strokes.

## The Tiger 5 Stats

1. **3-putts**
2. **Double bogeys**
3. **Bogeys on par 5s**
4. **Bogeys inside 9-iron range**
5. **Double chips**

## Key Decisions

- **Input method:** Live tally during the round — tap to increment each stat as it happens.
- **Persistence:** Store round history in SQLite for viewing trends over time.
- **Navigation:** New section in the existing On Course tab (via SubMenu).
- **Goals/targets:** None — purely tracking occurrences.
- **History detail level:** TBD (per-round totals vs. per-round with course name).

## User Stories

- As a golfer, I want to tap a button to record a Tiger 5 mistake during my round so I can track avoidable errors in real time.
- As a golfer, I want to see my running Tiger 5 tally for the current round so I know where I stand.
- As a golfer, I want to save my round tally so I can review it later.
- As a golfer, I want to view my Tiger 5 history across past rounds so I can identify trends and recurring mistakes.

## Database Schema Considerations

- New SQLite table for Tiger 5 rounds (e.g., `Tiger5Rounds`).
- Columns for each of the five stats (integer counts per round).
- Timestamp column for when the round was recorded.
- Optional: course name column (pending decision on history detail level).

## UI Placement

- Lives within the **On Course** tab as a new SubMenu section.
- Tally screen shows five labeled counters with tap-to-increment controls.
- History/trends accessible from the same section.

## Open Questions

- Should round history include a course name, or just date and totals?
- What does the trend view look like — simple list of past rounds, or charts/graphs?
- Should there be a way to edit or delete a saved round?
- Should the tally screen have an "end round" action, or auto-save on navigation away?
