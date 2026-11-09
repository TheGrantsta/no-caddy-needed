import { Tabs, useSegments } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColours } from '@/context/ThemeContext';
import ScreenWrapper from '@/components/ScreenWrapper';
import { getPracticeRemindersService } from '@/service/DbService';
import { tabBarStyleFor, sceneStyleFor } from '@/assets/tabBarOptions';

const isOverdue = () => {
  const reminders = getPracticeRemindersService();
  return reminders.some(r => new Date(r.ScheduledFor) < new Date());
};

export default function TabLayout() {
  const colours = useThemeColours();
  useSegments(); // Re-render on navigation changes so overdue badge stays current
  const hasOverdue = isOverdue();
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <ScreenWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          // Selected tab: primary-green icon and label on a light green-grey pill
          tabBarActiveTintColor: colours.primary,
          tabBarActiveBackgroundColor: colours.primary + '1F',
          tabBarInactiveTintColor: colours.tabInactive,
          tabBarInactiveBackgroundColor: 'transparent',
          // Each selected pill sits inside the bar with a small inset
          tabBarItemStyle: {
            // Fill the bar's height less the inset, so the selected pill covers icon and label
            height: 68,
            marginHorizontal: 4,
            marginVertical: 4,
            paddingHorizontal: 0,
            paddingVertical: 0,
            justifyContent: 'center',
            // Half the item height, so the selected tab is a circle/pill rather than a rounded square
            borderRadius: 34,
            // Clip the selected highlight to the rounded shape; it is painted on an inner view
            overflow: 'hidden',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          // Floating rounded bar inset from the screen edges, sitting above the home indicator
          tabBarStyle: tabBarStyleFor(colours, bottomInset),
          sceneStyle: sceneStyleFor(colours, bottomInset),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButtonTestID: 'tab-home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='home' color={color} size={28} />
            )
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: 'Play',
            tabBarButtonTestID: 'tab-play',
            tabBarIcon: ({ color }) => (
              <Ionicons name='golf-outline' color={color} size={30} />
            )
          }}
        />
        <Tabs.Screen
          name="my-bag"
          options={{
            title: 'My Bag',
            tabBarButtonTestID: 'tab-my-bag',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='backpack' color={color} size={28} />
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
                <MaterialIcons name='loop' color={color} size={28} />
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
            title: 'Stats',
            tabBarButtonTestID: 'tab-perform',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='bar-chart' color={color} size={28} />
            )
          }}
        />
      </Tabs>
    </ScreenWrapper>
  );
}
