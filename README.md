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

