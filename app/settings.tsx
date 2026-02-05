import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useToast } from 'react-native-toast-notifications';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import styles from '../assets/stlyes';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());

  const handleToggleTheme = async (value: boolean) => {
    const updated: AppSettings = { ...settings, theme: value ? 'light' : 'dark' };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    toast.show(success ? 'Settings saved' : 'Failed to save settings', {
      type: success ? 'success' : 'danger',
      textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
      style: {
        borderLeftColor: success ? colours.green : colours.errorText,
        borderLeftWidth: 10,
        backgroundColor: colours.yellow,
      },
    });
  };

  const handleToggleNotifications = async (value: boolean) => {
    const updated: AppSettings = { ...settings, notificationsEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    toast.show(success ? 'Settings saved' : 'Failed to save settings', {
      type: success ? 'success' : 'danger',
      textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
      style: {
        borderLeftColor: success ? colours.green : colours.errorText,
        borderLeftWidth: 10,
        backgroundColor: colours.yellow,
      },
    });
  };

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>Settings</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>Theme</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={styles.normalText}>{settings.theme === 'dark' ? 'Dark' : 'Light'}</Text>
          <Switch
            testID="theme-toggle"
            value={settings.theme === 'light'}
            onValueChange={handleToggleTheme}
            trackColor={{ false: colours.backgroundAlternate, true: colours.green }}
            thumbColor={colours.yellow}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>Notifications</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={styles.normalText}>{settings.notificationsEnabled ? 'On' : 'Off'}</Text>
          <Switch
            testID="notifications-toggle"
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colours.backgroundAlternate, true: colours.green }}
            thumbColor={colours.yellow}
          />
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
