# View and edit settings

## Concept

View and edit the settings for the app

## Key Decisions

- **Navigation method:** Click on the settings icon.
- **Persistence:** Retrieve setting information. Only one version of the information is stored at any point - i.e. changes over-write stored information.
- **Navigation:** Existing section in the app.

## User Stories

- As a golfer, I want to be able to view and edit my dark or light theme settings.
- As a golfer, I want to be able to view and edit my notification settings.

## Database Schema Considerations

- New table to hold the settings.
- Retrieved from the database and ordered by biggest number to shortest, group by name of club.

## UI Placement

- Lives within the **Settings** tab.
- Settings screen exists but contains the distance chart which needs to be removed.

## Open Questions

- Any?

## Status

- To be implemented

## Priority

- 40