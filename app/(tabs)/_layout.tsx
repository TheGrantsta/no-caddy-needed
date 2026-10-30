import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColours } from '@/context/ThemeContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import { getPracticeRemindersService } from '@/service/DbService';
import fontSizes from '@/assets/font-sizes';

const isOverdue = () => {
  const reminders = getPracticeRemindersService();
  return reminders.some(r => new Date(r.ScheduledFor) < new Date());
};

export default function TabLayout() {
  const colours = useThemeColours();
  useSegments(); // Re-render on navigation changes so overdue badge stays current
  const hasOverdue = isOverdue();

  return (
    <ScreenWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colours.primary,
          tabBarLabelStyle: {
            fontSize: fontSizes.smallestText
          },
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: colours.background,
              height: 80,
            },
            default: {
              backgroundColor: colours.background,
              height: 80,
            },
          })
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButtonTestID: 'tab-home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='home' color={color} size={32} />
            )
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: 'Play',
            tabBarButtonTestID: 'tab-play',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='sports-golf' color={color} size={32} />
            )
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Practice',
            tabBarButtonTestID: 'tab-practice',
            tabBarIcon: ({ color }) => (
              <View>
                <MaterialIcons name='loop' color={color} size={32} />
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
            title: 'Performance',
            tabBarButtonTestID: 'tab-perform',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='bar-chart' color={color} size={32} />
            )
          }}
        />
      </Tabs>
    </ScreenWrapper>
  );
}
