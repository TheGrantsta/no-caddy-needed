import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../context/ThemeContext';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';

const THEMES: { key: AppSettings['theme']; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

const VOICES: { key: AppSettings['voice']; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'neutral', label: 'Neutral' },
];

const NOTIFICATIONS: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

export default function Settings() {
  const { colours, setTheme } = useTheme();
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const { showSuccess, showResult } = useAppToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());

  const handleThemeChange = async (theme: AppSettings['theme']) => {
    const updated: AppSettings = { ...settings, theme };
    setSettings(updated);
    setTheme(theme);

    showSuccess('Settings saved');
  };

  const handleNotificationsChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, notificationsEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const handleVoiceChange = async (voice: AppSettings['voice']) => {
    const updated: AppSettings = { ...settings, voice };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const voiceButtonStyles = useMemo(() => ({
    base: {
      flex: 1,
      paddingVertical: 10,
      marginHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colours.backgroundAlternate,
    },
    selected: {
      backgroundColor: colours.yellow,
      borderColor: colours.yellow,
    },
    unselected: {
      backgroundColor: 'transparent',
    },
    selectedText: {
      color: colours.background,
      fontWeight: 'bold' as const,
    },
    unselectedText: {
      color: colours.text,
    },
  }), [colours]);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>Settings</Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>Theme</Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
          {THEMES.map(({ key, label }) => {
            const isSelected = settings.theme === key;
            return (
              <TouchableOpacity
                key={key}
                testID={`theme-${key}`}
                onPress={() => handleThemeChange(key)}
                style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
              >
                {isSelected && <Text testID={`theme-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>Notifications</Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
          {NOTIFICATIONS.map(({ key, label, value }) => {
            const isSelected = settings.notificationsEnabled === value;
            return (
              <TouchableOpacity
                key={key}
                testID={`notifications-${key}`}
                onPress={() => handleNotificationsChange(value)}
                style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
              >
                {isSelected && <Text testID={`notifications-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>Voice</Text>
        </View>

        <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
          {VOICES.map(({ key, label }) => {
            const isSelected = settings.voice === key;
            return (
              <TouchableOpacity
                key={key}
                testID={`voice-${key}`}
                onPress={() => handleVoiceChange(key)}
                style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
              >
                {isSelected && <Text testID={`voice-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
