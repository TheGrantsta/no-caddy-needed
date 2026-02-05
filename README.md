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

3. Build for Android and iOS

   ```bash
   eas build --platform android

   eas build --platform ios
   ```

   iOS requires Apple developer account

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
