import React, { useEffect, useState } from 'react';
import { Image } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import colours from "@/assets/colours";
import { initialize } from '@/database/db';
import { ToastProvider } from 'react-native-toast-notifications';
import * as Notifications from 'expo-notifications';
import NetworkStatus from '@/components/NetworkStatus';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const LogoTitle = () => (
    <Image
      source={require("../assets/images/full-logo-transparent-no-buffer.png")}
      style={{ width: 120, height: 40, resizeMode: "contain" }}
    />
  );

  useEffect(() => {
    const setupDatabase = () => {
      try {
        initialize();
      }
      catch (error) {
        console.error('Setup database error', error);
      }
    };

    setupDatabase();

    Notifications.requestPermissionsAsync();

    async function prepareApp() {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();

  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ToastProvider
      placement="bottom"
      dangerIcon={<MaterialIcons name="close" color={colours.errorText} size={24} />}
      successIcon={<MaterialIcons name="check" color={colours.background} size={24} />}
      offset={80}
      style={{
        maxWidth: "100%",
      }}
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerRight: () => (
                <Link href='../settings'>
                  <MaterialIcons name="settings" size={24} color={colours.background} style={{ marginRight: 15 }} />
                </Link>
              ),
              headerStyle: {
                backgroundColor: colours.yellow,
              },
            }} />
          <Stack.Screen
            name="short-game/putting"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="short-game/chipping"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="short-game/pitching"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="short-game/bunker"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="tools/random"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="tools/tempo"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="play/distances"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="play/wedge-chart"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="play/scorecard"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="settings"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
              headerTintColor: colours.background,
              headerBackButtonDisplayMode: 'minimal',
            }} />
          <Stack.Screen
            name="+not-found"
            options={{
              headerTitle: () => <LogoTitle />,
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: colours.yellow,
              },
            }} />
        </Stack>
        <StatusBar style="auto" />
        <NetworkStatus />
      </ThemeProvider>
    </ToastProvider>
  );
};
