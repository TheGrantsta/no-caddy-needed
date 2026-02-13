# Add course name including from recent list when starting a round

## Concept

When starting a new round, add the ability to add course name either free text or from 'recent' list, which is a distinct list of previously saved names, to help identify rounds. Show round name in the round history list

## Key Decisions

- **Navigation method:** Click the start round button and provide the opportunity to enter or select course name
- **Persistence:** Save course name with the round
- **Navigation:** Existing navigation

## User Stories

- As a golfer, I want to be able to enter the course name when starting a round.
- As a golfer, I want to be able to see the course name in the round history.
- As a golfer, I want to be able to see the course name when viewing the scorecard.

## Database Schema Considerations

- Existing schema for saving round information need to be amended to support course name.

## UI Placement

- Lives within the **On Course** tab.
- Scorecard screen will be a new screen with only a back button in the top right.

## Open Questions

- Any?

## Status

- Complete

## Priority

- 40