# View and edit wedge chart

## Concept

View and edit the wedge chart to make better decisions on the course. The wedge chart supports a maximum of 4 clubs, names to be entered by the golfer, with up to 6 distances. The golfer can enter the names for the different distances. The chart layout is to be determined by providing the best, most intuitive user interface

## Key Decisions

- **Navigation method:** Click on the sub-menu option 'Wedge chart'.
- **Persistence:** Retrieve wedge chart information. Only one version of the information is stored at any point - i.e. changes over-write stored information.
- **Navigation:** Existing section in the Play tab via 'Wedge chart' sub menu option.

## User Stories

- As a golfer, I want to be able to view my saved wedge chart.
- As a golfer, I want to be able to edit my saved wedge chart.

## Database Schema Considerations

- Existing table to hold the distance chart information but probably will need to be amended.
- Retrieved from the database and ordered by biggest number to shortest, group by name of club.

## UI Placement

- Lives within the **On Course** tab.
- Wedge chart screen exists but is empty.

## Open Questions

- Any?

## Status

- Complete

## Priority

- 30