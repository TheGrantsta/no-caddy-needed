import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import ScreenWrapper from '../screen-wrapper';
import { getPracticeRemindersService } from '@/service/DbService';

export default function TabLayout() {
  const colours = useThemeColours();
  useSegments(); // Re-render on navigation changes so overdue badge stays current
  const reminders = getPracticeRemindersService();
  const hasOverdue = reminders.some(r => new Date(r.ScheduledFor) < new Date());

  return (
    <ScreenWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colours.primary,
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
              <View>
                <MaterialIcons name='golf-course' color={color} size={30} />
                {hasOverdue && (
                  <View
                    testID="practice-overdue-badge"
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colours.red,
                    }}
                  />
                )}
              </View>
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
