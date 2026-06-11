import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { openStoreReviewService } from '../service/ReviewService';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../context/ThemeContext';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';

const VOICES: { key: AppSettings['voice']; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'neutral', label: 'Neutral' },
];

const NOTIFICATIONS: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

const SOUNDS: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

const PRESHOT: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

export default function Settings() {
  const { colours } = useTheme();
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const { showSuccess, showResult } = useAppToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [routineText, setRoutineText] = useState(settings.preShotRoutineText);

  const handleNotificationsChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, notificationsEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const handleSoundsChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, soundsEnabled: value };
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

  const handleFrequencyChange = async (delta: number) => {
    const next = Math.max(1, settings.practiceFrequencyDays + delta);
    const updated: AppSettings = { ...settings, practiceFrequencyDays: next };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const handlePreShotEnabledChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, preShotReminderEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const handleRoutineTextChange = async () => {
    const updated: AppSettings = { ...settings, preShotRoutineText: routineText };
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
      borderColor: colours.primary,
    },
    selected: {
      backgroundColor: colours.primary,
      borderColor: colours.primary,
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
      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding, { flexGrow: 1 }]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>Settings</Text>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerContainer}>
            <Text style={[styles.subHeaderText, { padding: 0 }]}>Notifications</Text>
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
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerContainer}>
            <Text style={[styles.subHeaderText, { padding: 0 }]}>Sounds</Text>
          </View>

          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
            {SOUNDS.map(({ key, label, value }) => {
              const isSelected = settings.soundsEnabled === value;
              return (
                <TouchableOpacity
                  key={key}
                  testID={`sounds-${key}`}
                  onPress={() => handleSoundsChange(value)}
                  style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
                >
                  {isSelected && <Text testID={`sounds-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                  {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerContainer}>
            <Text style={[styles.subHeaderText, { padding: 0 }]}>Voice</Text>
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
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerContainer}>
            <Text style={[styles.subHeaderText, { padding: 0 }]}>Practice</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 16 }}>
            <Text style={styles.normalText}>Every</Text>
            <TouchableOpacity
              testID="practice-frequency-decrement"
              onPress={() => handleFrequencyChange(-1)}
              style={[voiceButtonStyles.base, { flex: 0, paddingHorizontal: 16 }]}
            >
              <Text style={voiceButtonStyles.unselectedText}>−</Text>
            </TouchableOpacity>
            <Text testID="practice-frequency-value" style={styles.normalText}>{settings.practiceFrequencyDays}</Text>
            <TouchableOpacity
              testID="practice-frequency-increment"
              onPress={() => handleFrequencyChange(1)}
              style={[voiceButtonStyles.base, { flex: 0, paddingHorizontal: 16 }]}
            >
              <Text style={voiceButtonStyles.unselectedText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.normalText}>days</Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerContainer}>
            <Text style={[styles.subHeaderText, { padding: 0 }]}>Pre-shot routine</Text>
          </View>

          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
            {PRESHOT.map(({ key, label, value }) => {
              const isSelected = settings.preShotReminderEnabled === value;
              return (
                <TouchableOpacity
                  key={key}
                  testID={`preshot-${key}`}
                  onPress={() => handlePreShotEnabledChange(value)}
                  style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
                >
                  {isSelected && <Text testID={`preshot-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                  {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {settings.preShotReminderEnabled && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
              <TextInput
                testID="preshot-routine-input"
                style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top', paddingVertical: 10 }]}
                value={routineText}
                onChangeText={setRoutineText}
                onEndEditing={handleRoutineTextChange}
                multiline
                placeholder="Your pre-shot routine"
                placeholderTextColor={colours.tertiary}
              />
            </View>
          )}
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 20, marginTop: 'auto' }}>
          <TouchableOpacity
            testID="rate-app-button"
            style={styles.largeButton}
            onPress={openStoreReviewService}
          >
            <Text style={styles.buttonText}>Rate my app</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', paddingVertical: 20, marginTop: 'auto' }}>
          <Text style={styles.normalText}>
            Version {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>
    </GestureHandlerRootView >
  );
}
