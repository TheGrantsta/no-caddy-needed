import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import ScreenWrapper from '../screen-wrapper';

export default function TabLayout() {
  const colours = useThemeColours();

  return (
    <ScreenWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colours.yellow,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: colours.background,
            },
            default: {
              backgroundColor: colours.background,
            },
          })
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='home' color={color} size={30} />
            )
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: 'Play',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='sports-golf' color={color} size={30} />
            )
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Practice',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='golf-course' color={color} size={30} />
            )
          }}
        />
        <Tabs.Screen
          name="perform"
          options={{
            title: 'Perform',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='lightbulb' color={color} size={30} />
            )
          }}
        />
      </Tabs>
    </ScreenWrapper>
  );
}
