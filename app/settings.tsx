import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { openStoreReviewService } from '../service/ReviewService';
import { buildStatsExportPayload, formatStatsExportText, writeStatsExportFile } from '../service/ExportService';
import { useStyles } from '../hooks/useStyles';
import { useTheme } from '../context/ThemeContext';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';
import OnboardingOverlay from '../components/OnboardingOverlay';
import CtaButton from '../components/CtaButton';

const ONBOARDING_STEPS = [
  { text: 'Settings let you tailor No Caddy Needed to how you like to play.' },
  { text: 'Turn notifications and sounds on or off, and choose the voice for the random number generator.' },
  { text: 'Set how often you are reminded to practise, edit your pre-shot routine, and rate the app.' },
];

const VOICES: { key: AppSettings['voice']; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'neutral', label: 'Neutral' },
];

const UNITS: { key: AppSettings['units']; label: string }[] = [
  { key: 'yards', label: 'Yards' },
  { key: 'metres', label: 'Metres' },
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

const SCORE_ONLY: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

const BAD_HOLE_REASSURANCE: { key: 'on' | 'off'; label: string; value: boolean }[] = [
  { key: 'on', label: 'On', value: true },
  { key: 'off', label: 'Off', value: false },
];

export default function Settings() {
  const { colours } = useTheme();
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const { showResult, showError } = useAppToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [routineText, setRoutineText] = useState(settings.preShotRoutineText);
  const [showOnboarding, setShowOnboarding] = useState(!settings.settingsOnboardingSeen);
  const [group, setGroup] = useState<'golf' | 'system'>('golf');

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const updated: AppSettings = { ...settings, settingsOnboardingSeen: true };
    setSettings(updated);
    await saveSettingsService(updated);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

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

  const handleUnitsChange = async (units: AppSettings['units']) => {
    const updated: AppSettings = { ...settings, units };
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

  const handleScoreOnlyModeChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, skipStatsFlowEnabled: value };
    setSettings(updated);

    const success = await saveSettingsService(updated);

    showResult(success, 'Settings saved', 'Failed to save settings');
  };

  const handleBadHoleReassuranceChange = async (value: boolean) => {
    const updated: AppSettings = { ...settings, badHoleReassuranceEnabled: value };
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

  const handleExportStats = async () => {
    try {
      const payload = buildStatsExportPayload();
      const text = formatStatsExportText(payload);
      const fileUri = await writeStatsExportFile(text);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showError('Failed to export stats');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export golf stats',
      });
    } catch {
      showError('Failed to export stats');
    }
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
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity testID="settings-info-button" onPress={handleShowOnboarding}>
              <MaterialIcons name="info-outline" size={26} color={colours.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerText, styles.marginTop]}>Settings</Text>
          </View>
        </View>

        <View style={styles.segmentedControlWrapper}>
          <View style={styles.segmentedControl}>
            {([
              { key: 'golf', label: 'Golf', icon: 'golf-course' },
              { key: 'system', label: 'System', icon: 'phone-iphone' },
            ] as const).map(({ key, label, icon }) => {
              const isSelected = group === key;
              return (
                <TouchableOpacity
                  key={key}
                  testID={`settings-tab-${key}`}
                  onPress={() => setGroup(key)}
                  style={[styles.segment, isSelected ? styles.segmentSelected : null]}
                >
                  <MaterialIcons name={icon} size={22} color={isSelected ? colours.white : colours.tertiary} />
                  <Text style={isSelected ? styles.segmentTextSelected : styles.segmentText}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {group === 'system' && (<>
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
              <Text style={[styles.subHeaderText, { padding: 0 }]}>Units</Text>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
              {UNITS.map(({ key, label }) => {
                const isSelected = settings.units === key;
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`units-${key}`}
                    onPress={() => handleUnitsChange(key)}
                    style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
                  >
                    {isSelected && <Text testID={`units-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                    {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>)}

        {group === 'golf' && (<>
          <View style={styles.contentSection}>
            <View style={styles.headerContainer}>
              <Text style={[styles.subHeaderText, { padding: 0 }]}>Show pre-shot routine</Text>
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
                  style={[styles.textInput, { height: undefined, minHeight: 110, textAlignVertical: 'top', paddingVertical: 10 }]}
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

          <View style={styles.contentSection}>
            <View style={styles.headerContainer}>
              <Text style={[styles.subHeaderText, { padding: 0 }]}>Score-only mode</Text>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
              {SCORE_ONLY.map(({ key, label, value }) => {
                const isSelected = settings.skipStatsFlowEnabled === value;
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`score-only-${key}`}
                    onPress={() => handleScoreOnlyModeChange(value)}
                    style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
                  >
                    {isSelected && <Text testID={`score-only-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                    {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.headerContainer}>
              <Text style={[styles.subHeaderText, { padding: 0 }]}>Bad hole reminder</Text>
            </View>

            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 }}>
              {BAD_HOLE_REASSURANCE.map(({ key, label, value }) => {
                const isSelected = settings.badHoleReassuranceEnabled === value;
                return (
                  <TouchableOpacity
                    key={key}
                    testID={`bad-hole-reassurance-${key}`}
                    onPress={() => handleBadHoleReassuranceChange(value)}
                    style={[voiceButtonStyles.base, isSelected ? voiceButtonStyles.selected : voiceButtonStyles.unselected]}
                  >
                    {isSelected && <Text testID={`bad-hole-reassurance-${key}-selected`} style={voiceButtonStyles.selectedText}>{label}</Text>}
                    {!isSelected && <Text style={voiceButtonStyles.unselectedText}>{label}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>)}

        <View style={styles.contentSection}>
          <CtaButton
            testID="export-stats-button"
            label="Export my stats"
            icon="ios-share"
            onPress={handleExportStats}
          />
        </View>

        <View style={styles.contentSection}>
          <CtaButton
            testID="rate-app-button"
            label="Rate my app"
            icon="star"
            onPress={openStoreReviewService}
          />
        </View>

        <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 20 }}>
          <Text style={styles.normalText}>
            Version {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Settings guide"
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView >
  );
}
