import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colours from '@/assets/colours';

export default function TabLayout() {

  return (
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
        }),
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
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='golf-course' color={color} size={30} />
          )
        }}
      />
      <Tabs.Screen
        name="on-course"
        options={{
          title: 'On course',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='sports-golf' color={color} size={30} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name='settings' color={color} size={30} />
          )
        }}
      />
    </Tabs>
  );
}
