import React, { useEffect, useState } from 'react';
import { Image, LogBox, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { initialize } from '@/database/db';
import { ToastProvider } from 'react-native-toast-notifications';
import NetworkStatus from '@/components/NetworkStatus';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppThemeProvider, useTheme } from '@/context/ThemeContext';

LogBox.ignoreAllLogs();

let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Native module not available
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const LogoTitle = () => (
  <Image
    source={require("../assets/images/full-white-logo-transparent-no-buffer.png")}
    style={{ width: 120, height: 40, resizeMode: "contain" }}
  />
);

function ThemedApp() {
  const { theme, colours } = useTheme();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
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
              backgroundColor: colours.primary,
            },
          }} />
        <Stack.Screen
          name="short-game/putting"
          options={{
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
            },
            headerTintColor: colours.background,
            headerBackButtonDisplayMode: 'minimal',
          }} />
        <Stack.Screen
          name="tools/reminders"
          options={{
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
            },
            headerTintColor: colours.background,
            headerBackButtonDisplayMode: 'minimal',
          }} />
        <Stack.Screen
          name="play/deadly-sin-trend"
          options={{
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colours.primary,
            },
            headerTintColor: colours.background,
            headerBackButtonDisplayMode: 'minimal',
          }} />
        <Stack.Screen
          name="play/round-analysis"
          options={{
            headerTitle: () => <LogoTitle />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
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
              backgroundColor: colours.primary,
            },
          }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <NetworkStatus />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    async function prepareApp() {
      try {
        // Initialize database first
        await initialize();

        // Request notification permissions if available
        if (Notifications) {
          Notifications.requestPermissionsAsync();
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ToastProvider
        placement="bottom"
        offset={80}
        style={{
          maxWidth: "100%",
        }}
        renderType={{
          success: (toast) => (
            <View style={[toastStyles.container, { borderLeftColor: '#00C851' }]}>
              <Text style={toastStyles.message}>{toast.message}</Text>
              <TouchableOpacity testID="toast-close-button" onPress={toast.onHide} style={toastStyles.closeButton}>
                <Text style={toastStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ),
          danger: (toast) => (
            <View style={[toastStyles.container, { borderLeftColor: '#fd0303' }]}>
              <Text style={toastStyles.message}>{toast.message}</Text>
              <TouchableOpacity testID="toast-close-button" onPress={toast.onHide} style={toastStyles.closeButton}>
                <Text style={toastStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <AppThemeProvider>
          <ThemedApp />
        </AppThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

const toastStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D5A3D',
    borderLeftWidth: 10,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    maxWidth: '100%',
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
