import { Tabs, useSegments, useRouter } from 'expo-router';
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
  const router = useRouter();
  useSegments(); // Re-render on navigation changes so overdue badge stays current
  const hasOverdue = isOverdue();

  return (
    <ScreenWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colours.red,
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
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='home' color={color} size={32} />
            )
          }}
        />
        <Tabs.Screen
          name="play"
          options={{
            title: 'Play',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='sports-golf' color={color} size={32} />
            )
          }}
        />
        <Tabs.Screen
          name="practice"
          options={{
            title: 'Practice',
            tabBarIcon: ({ color }) => (
              <View>
                <MaterialIcons name='golf-course' color={color} size={32} />
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
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) return;
              if (!isOverdue()) return;
              e.preventDefault();
              router.navigate({
                pathname: '/practice',
                params: { section: 'tools', t: String(Date.now()) }
              });
              router.push('/tools/reminders');
            }
          })}
        />
        <Tabs.Screen
          name="perform"
          options={{
            title: 'Performance',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name='lightbulb' color={color} size={32} />
            )
          }}
        />
      </Tabs>
    </ScreenWrapper>
  );
}
