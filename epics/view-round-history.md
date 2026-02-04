# View and edit previously saved rounds from the round history screen

## Concept

View the scorecard for a previously saved round and give the person the option of editing the round. The edit function will need a confirmation, with the same flow as 'end round', to avoid accident updates

## Key Decisions

- **Navigation method:** Click the whole line on round history, or an icon representing the scorecard - depends on what feels more natural having implemented vertical scrolling of the list
- **Persistence:** Retrieve scorecard and player information based on round id. Update based on round id.
- **Navigation:** New section in the existing Play tab via Play home screen showing round history.

## User Stories

- As a golfer, I want to be able to view the scorecard for a previously saved round.
- As a golfer, I want to be able to edit a previously saved round when viewing the scorecard.

## Database Schema Considerations

- Existing schema should support retrieving and deleting previously saved rounds based on round id.

## UI Placement

- Lives within the **On Course** tab.
- Scorecard screen will be a new screen with only a back button in the top right.

## Open Questions

- Any?

## Status

- To be implemented

## Priority

- 10