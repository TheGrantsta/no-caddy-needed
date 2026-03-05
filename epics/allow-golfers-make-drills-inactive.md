# Allow golfers to make drills as inactive

## Concept

Practice drills are currently held in code within the application and all drills are active by default. To enable golfers to mark drills as active or inactive, the drills will need to be held in persistant storage with a light-weight admin interface.

## Key Decisions

- **Navigation method:** Navigation to the drills remains unchanged; however, navigating to the administrator of the drills needs to be considered. It could be possible to add a toggle to each drill so they can be enabled and disabled individually
- **Persistence:** Drills will need to be moved from the ShortGameConfig file into the database
- **Navigation:** For drills this remains unchanged. The decision above for 'Navigation method' may require new navigation

## User Stories

- As a golfer, I want to be able to mark as inactive drills that I do not intend to do.
- As a golfer, I want to be able to mark as ictive drills that I do not intend to do.

## Database Schema Considerations

- Rename existing table "Drills" to "DrillHistory"
- Amend "DrillHistory" to have foreign key relationship with new table "Drills" - add column: DrillId
- New table "Drills" to hold the ShortGameData - columns: Id (Primary Key), Category, Label, IconName, Target, Objective, SetUp, HowToPlay, IsActive (boolean: default to true)

## Database Service Layer Considerations

- Amend references to "Drills" to retrieve data from "DrillHistory"
- Add function to retrieve drills by category and ordered by active, drill name
- Amend ShortGameData to retrieve drills by category instead of relying on hard-coded array list 

## UI Placement

- Lives within the **Practive** tab.
- Drill screens will remain largely unchanged except for the addition of the active/inactive toggle - placement to be confirmed
- Drill history screen remains unchanged - the only change relates to the retrieval of the drill history from new amended table via the service layer (the service layer already exists)

## Open Questions

- Any?

## Status

- Complete

## Priority

- 100