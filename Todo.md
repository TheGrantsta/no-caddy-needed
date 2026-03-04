# To do
- [ ] Deprecation warning in debugger
- [ ] Create 'skill' to run screen shots on remote push
- [ ] Integrate Firebase iOS into project
- [ ] Complete Google Play setup
- [ ] Expo-notifications warning message
- [ ] Add ability for players to add their own practice drills
- [ ] Integrate Firebase Android into project
- [ ] Enable submission from EAS to Google Play

# Done
- [X] Fix failing Android build
- [X] Reorder Tiger 5 so that dynamic options are last in the order
- [X] Fix scorecard entry to remove duplication
- [X] Fix component name from MultiplayerHoleScoreInput to HoleScoreInput (MultiplayerHoleScoreInput.tsx)
- [X] Fix component name from MultiplayerScorecard to Scorecard (MultiplayerScorecard.tsx)
- [X] Remove unused Prop 'round' from scorecard (scorecard.tsx)
- [X] Remove course par from database and codebase
- [X] Change the order of the Tiger 5 chart to match the input screen
- [X] Only show Tiger 5 Tally double bogey when score is par + 2 - and not onload
- [X] Amend size of the 7 Deadly Sins tally
- [X] Don't show 7DS chart on edit scorecard screen
- [X] Enable option to run screenshots without onboarding screens
- [X] Fix issue where 7DS does not show the correct answer
- [X] Fix issue where 7DS does not appear to be saved
- [X] Remove references and names relating to Tiger5
- [X] Generate App Store compliant screen shots
- [X] Fix issue where 7DS is not deleted when the round is deleted
- [X] Add filters for 7DS & Round history
- [X] Save button does not follow the same format when saving scorecard
- [X] Upgrade iOS SDK from 18.2 to 26
- [X] Random number out loud 
- [X] Support voice command ('caddy: next')
- [X] Remove Expo warning in CLI
- [X] Save tempo speed between sessions
- [X] Amend settings page to replace toggle with buttons
- [X] Show holes played if not a full round on scorecard summary
- [X] Create list of recent players like recent golf courses
- [X] Fix vulnerabilities in the npm packages - npm audit / npm audit fix
- [X] Add build version to bottom of Settings page
- [X] Add test coverage tool and include in pre-hook push

# Ignored
- [-] Change tempo speed (faster or slower) using voice command ('caddy: faster / slower')
- [-] SafeAreaView has been deprecation warning message

# Release notes
* Show selectable list of recent players when starting a round
* Show number of holes played in 'Round history' for incomplete rounds
* Add voice control commands for 'Random number generator' screen
* Persist tempo user settings between sessions

