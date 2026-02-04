# View and edit distance chart

## Concept

View and edit the distance chart to make better decisions on the course. The distance chart supports a maximum of 14 clubs, names to be entered by the golfer, with two distances: 'carry' and 'total'. The chart is a vertical table with three columns with the headings 'club', 'carry' and 'total'.

## Key Decisions

- **Navigation method:** Click on the sub-menu option 'Distances'.
- **Persistence:** Retrieve distance chart information. Only one version of the information is stored at any point - i.e. changes over-write stored information.
- **Navigation:** Existing section in the Play tab via 'Distances' sub menu option.

## User Stories

- As a golfer, I want to be able to view my saved distance chart.
- As a golfer, I want to be able to edit my saved distance chart.

## Database Schema Considerations

- New table to hold the distance chart information.
- Retrieved from the database and ordered by longest 'carry' number to shortest.

## UI Placement

- Lives within the **On Course** tab.
- Distances screen exists but is empty.

## Open Questions

- Any?

## Status

- To be implemented

## Priority

- 20