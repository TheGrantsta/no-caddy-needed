import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../context/ThemeContext';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';
import { t } from '../assets/i18n/i18n';

export default function Settings() {
  const { colours, setTheme } = useTheme();
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const { showSuccess, showResult } = useAppToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());

  const handleToggleTheme = async (value: boolean) => {
    const newTheme = value ? 'light' : 'dark';
    const updated: AppSettings = { ...settings, theme: newTheme };
    setSettings(updated);
    setTheme(newTheme);

    showSuccess(t('settings.saved'));
  };

  const handleToggleNotifications = async (value: boolean) => {
    const updated: AppSettings = { ...settings, notificationsEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, t('settings.saved'), t('settings.saveFailed'));
  };

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>{t('settings.title')}</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>{t('settings.theme')}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={styles.normalText}>{settings.theme === 'dark' ? t('settings.dark') : t('settings.light')}</Text>
          <Switch
            testID="theme-toggle"
            value={settings.theme === 'light'}
            onValueChange={handleToggleTheme}
            trackColor={{ false: colours.backgroundAlternate, true: colours.green }}
            thumbColor={colours.yellow}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>{t('settings.notifications')}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={styles.normalText}>{settings.notificationsEnabled ? t('settings.on') : t('settings.off')}</Text>
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
