# Allow golfers to add drills

## Concept

Practice drills are currently held in the database and all drills are active by default and shown to all golfers. To enable golfers to add drills for things they are working on with the data held in persistant storage with a light-weight admin interface.

## Key Decisions

- **Navigation method:** Navigation to the drills remains unchanged; however, navigating to the administrator of the drills needs to be considered. It could be possible to add a "Add drill" button to each category screen
- **Persistence:** Drills will need to be moved from the ShortGameConfig file into the database (previous epic) with the ability to insert new drill
- **Navigation:** For drills this remains unchanged. The decision above for 'Navigation method' may require new navigation

## User Stories

- As a golfer, I want to be able to mark as inactive drills that I do not intend to do.
- As a golfer, I want to be able to mark as ictive drills that I do not intend to do.

## Database Schema Considerations

- Rename existing table "Drills" to "DrillHistory"
- Amend "DrillHistory" to have foreign key relationship with new table "Drills" - add column: DrillId
- New table "Drills" to hold the ShortGameData - columns: Id (Primary Key), Category, Label, IconName, Target, Objective, SetUp, HowToPlay, IsActive (boolean: default to true)

## Database Service Layer Considerations

- Add function to insert a new drill - newly created drills should be returned as part of the normal retrieval process

## UI Placement

- Lives within the **Practive** tab.
- Drill screens will remain largely unchanged except for the addition of the "Add drill" functionality - placement to be confirmed
- All user created drills will 'inherit' the category name based on the current category
- All user created drills will have the same icon - IconName: [to be determined]
- All fields will be mandatory and "active" will default to true

## Open Questions

- Any?

## Status

- Complete

## Priority

- 110