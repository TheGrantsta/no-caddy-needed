# Delete previously saved rounds from the round history screen

## Concept

Delete the scorecard for a previously saved round clicking on the scorecard row. The view/edit scorecard screen include 'Delete round' button with confirmation like 'end round'

## Key Decisions

- **Navigation method:** Click the whole line on round history, or an icon representing the scorecard - depends on what feels more natural having implemented vertical scrolling of the list
- **Persistence:** Delete based on round id
- **Navigation:** New section in the existing Play tab via Play home screen showing round history

## User Stories

- As a golfer, I want to be able to delete a previously saved round when viewing the scorecard.

## Database Schema Considerations

- Existing schema should support deleting previously saved rounds based on round id.

## UI Placement

- Lives within the **On Course** tab.

## Open Questions

- Any?

## Status

- Complete

## Priority

- 17