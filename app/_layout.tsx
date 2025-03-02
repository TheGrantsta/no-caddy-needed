import React, { useEffect } from 'react';
import { Image, TouchableOpacity } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import colours from "@/assets/colours";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const LogoTitle = () => (
    <Image
      source={require("../assets/images/logo.png")} // Place your logo in assets folder
      style={{ width: 120, height: 40, resizeMode: "contain" }}
    />
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: "center",
            headerRight: () => (
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color={colours.background} style={{ marginRight: 15 }} />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: colours.yellow,
            },
          }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
