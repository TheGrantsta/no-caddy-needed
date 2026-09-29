import { useState, useRef, useEffect } from 'react';
import { Animated, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sharing from 'expo-sharing';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { openStoreReviewService } from '../service/ReviewService';
import { buildStatsExportPayload, formatStatsExportText, writeStatsExportFile } from '../service/ExportService';
import { useStyles } from '../hooks/useStyles';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';
import OnboardingOverlay from '../components/OnboardingOverlay';
import SettingsHeader from '../components/SettingsHeader';
import SettingsTabBar from '../components/SettingsTabBar';
import SystemSettings from '../components/SystemSettings';
import GolfSettings from '../components/GolfSettings';
import SettingsFooter from '../components/SettingsFooter';

const ONBOARDING_STEPS = [
  { text: 'Settings let you tailor No Caddy Needed to how you like to play.' },
  { text: 'Turn notifications and sounds on or off, and choose the voice for the random number generator.' },
  { text: 'Set how often you are reminded to practise, edit your pre-shot routine, and rate the app.' },
];

export default function Settings() {
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const { showResult, showError } = useAppToast();
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [routineText, setRoutineText] = useState(settings.preShotRoutineText);
  const [showOnboarding, setShowOnboarding] = useState(!settings.settingsOnboardingSeen);
  const [group, setGroup] = useState<'golf' | 'system'>('golf');
  const [showRoutineInput, setShowRoutineInput] = useState(settings.preShotReminderEnabled);
  const routineFadeAnim = useRef(new Animated.Value(settings.preShotReminderEnabled ? 1 : 0)).current;

  useEffect(() => {
    if (settings.preShotReminderEnabled) {
      setShowRoutineInput(true);
    }
    Animated.timing(routineFadeAnim, {
      toValue: settings.preShotReminderEnabled ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      if (!settings.preShotReminderEnabled) {
        setShowRoutineInput(false);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.preShotReminderEnabled]);

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

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding, { flexGrow: 1 }]}>
        <SettingsHeader onInfoPress={handleShowOnboarding} />
        <SettingsTabBar group={group} onGroupChange={setGroup} />

        {group === 'system' && (
          <SystemSettings
            settings={settings}
            onNotificationsChange={handleNotificationsChange}
            onSoundsChange={handleSoundsChange}
            onVoiceChange={handleVoiceChange}
            onUnitsChange={handleUnitsChange}
          />
        )}

        {group === 'golf' && (
          <GolfSettings
            settings={settings}
            routineText={routineText}
            onRoutineTextChange={setRoutineText}
            onRoutineTextSave={handleRoutineTextChange}
            showRoutineInput={showRoutineInput}
            routineFadeAnim={routineFadeAnim}
            onPreShotEnabledChange={handlePreShotEnabledChange}
            onScoreOnlyModeChange={handleScoreOnlyModeChange}
            onBadHoleReassuranceChange={handleBadHoleReassuranceChange}
          />
        )}

        <SettingsFooter
          onExportStats={handleExportStats}
          onRateApp={openStoreReviewService}
        />
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
