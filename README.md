# No caddy needed

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install -g cli

   npm install -g eas-cli
   ```

2. Create the app

   ```bash
   npx create-expo-app no-caddy-needed
   ```

3. Check the project was created successfully

   ```bash
   cd no-caddy-needed

   npx expo start
   ```

4. Install dependencies and vector icons

   ```bash
   npm install @react-navigation/native react-native-screens react-native-safe-area-context

   npm install @expo/vector-icons
   ```

5. Check project

   ```bash
   npx expo-doctor@latest
   ```

   fix any issues

6. Native modules required

   ```bash
      npx expo prebuild --clean; npx expo run:ios
   ```

   Voice recognition is part of the random number generator page so requires expo-speech-recognition installed with native modules

## Building project

1. Login into EAS (free tier)

   ```bash
   eas login
   ```

   prompted for username and password

   ```bash
   eas whoami
   ```

   this will verify login because if successful it will display your username

2. Configure EAS

   ```bash
   eas configure
   ```

3. Amend project for submission

* Increment the App Version in the app.json

* Update the 'WHATS_NEW' array with what is new in this release

* Tag the commit

   ```bash
   git tag -a '<annotation>' -m '<message>'
   ```

4. Single CLI command - build and submit

   ```bash
   eas build --platform android; eas submit --platform android --profile production --latest

   eas build --platform ios --profile production; eas submit --platform ios --latest
   ```

## Capturing screenshots

1. Install maestro

   ```bash
   npm install -g maestro-cli
   ```
2. Connect device

   ```bash
   maestro devices
   ```

3. Run screenshots
   
   ```bash
   maestro test .maestro/screenshots.yaml
   ```
   
## Testing and pushing

### Unit tests

- `npm test` runs the unit tests. `npm run test:coverage` adds the coverage report, which must stay above 50% for statements and branches.
- The pre-push hook runs `npm run test:coverage` on every `git push`. A failing test stops the push.
- GitHub Actions (`.github/workflows/unit-tests.yml`) runs the same suite on every push and pull request.

### UI checks

The UI checks need a booted iOS simulator and Maestro, and they are not run by `git push`. Git keeps its connection to GitHub open while the hook runs, and the UI checks take longer than that connection stays idle, so a push that ran them would fail.

Run them yourself before pushing a change that affects the UI:

```bash
npm run ui:verify
```

This runs three steps in order:
1. `ui:check` captures screenshots with `.maestro/screenshots.yaml` and compares each one with `.maestro/baselines/`. It fails if any screenshot differs by more than 0.5% of its pixels. Diff images go to `.maestro/diff-output/`.
2. `test:e2e` runs `.maestro/start-round.yaml`: score-only mode, a full 18-hole round.
3. `test:e2e:stats` runs `.maestro/stats-flow.yaml`: a multi-step round with deadly sins and the club picker.

Install Maestro first (`npm install -g maestro-cli`) and check that your simulator is listed with `maestro devices`.

### Approving visual changes

When a screenshot change is intended, update the baselines and commit them:

```bash
npm run ui:update
git add .maestro/baselines/
git commit -m "Update UI baselines: <reason>"
```

### Pushing

```bash
git push
```

This runs the unit tests and nothing else. Run `npm run ui:verify` first when the change affects the UI.

## App Store submission

App Store needs images with 1242x2688px but the screen shots produced using maestro have an output of 1320x2868px.

To resize, run resize-crop command from the .maestro folder

   ```
      node resize-crop.js input.png output.png
   ```

The resulting output images can be upload via browser.

## Integrating with AI

Repomix can create a prompt-friendly version of your repo that can be uploaded along with a prompt into an AI-assistant

1. Install repomix

   ```bash
   npm install -g repomix
   ```

2. Create output

   ```bash
   repomix
   ```

   This will generate a repomix-output.txt file in the current directory

3. Prompt suggestion

   ```AI
   This file contains all the files in the repository combined into one. I want to refactor the code, so please review it first. Suggest improvements as todo list
   ```

## Agentic AI

### Claude 

   ```Epic implementation suggestion
      You are an implementation engine.

      Given the epic below, do not restate it.
      Do not add features.
      Do not explain decisions.

      Task:
      Break this epic into the minimum set of implementation tasks that fully satisfy the acceptance criteria.

      Output format:
      - Task ID
      - Task description (1 sentence)
      - Inputs
      - Outputs
      - Done condition (objective)

      Epic:
      <PASTE EPIC>
   ```

## Resources

Icons are from the below

### Icons

```
https://fonts.google.com/icons?icon.size=24&icon.color=%23ffd33d&selected=Material+Symbols+Outlined:lists:FILL@0;wght@400;GRAD@0;opsz@24
```

### Firebase

```
https://console.firebase.google.com/u/0/?pli=1
```

### Beta testing

```
https://console.firebase.google.com/u/0/?pli=1
```

### Reporting project metrics

It is possible within the project to capture and report metrics for the project like lines of code, number of files, number of database tables, dependencies, and size of the project on disc

Useful for checking the project is not bloated

```
npm run metrics
```