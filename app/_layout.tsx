import React, { useEffect } from 'react';
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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const LogoTitle = () => (
    <Image
      source={require("../assets/images/FullLogo_Transparent_NoBuffer.png")}
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

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
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
    </ThemeProvider>
  );
}
