import { useState } from 'react';
import { useToggle } from '../hooks/useToggle';
import { ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sharing from 'expo-sharing';
import { getSettingsService, saveSettingsService, AppSettings } from '../service/DbService';
import { openStoreReviewService } from '../service/ReviewService';
import { buildStatsExportPayload, formatStatsExportText, writeStatsExportFile } from '../service/ExportService';
import { useStyles } from '../hooks/useStyles';
import { useOrientation } from '../hooks/useOrientation';
import { useAppToast } from '../hooks/useAppToast';
import OnboardingOverlay from '../components/OnboardingOverlay';
import PageHeader from '../components/PageHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColours } from '../context/ThemeContext';
import SystemSettings from '../components/SystemSettings';
import GolfSettings from '../components/GolfSettings';
import SettingsFooter from '../components/SettingsFooter';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

export default function Settings() {
  const styles = useStyles();
  const colours = useThemeColours();
  const router = useRouter();
  const { landscapePadding } = useOrientation();
  const { showResult, showError } = useAppToast();
  const [exporting, setExporting] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [showOnboarding, , setShowOnboarding] = useToggle(!settings.settingsOnboardingSeen);


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

  const handleExportStats = async () => {
    setExporting(true);
    try {
      const payload = buildStatsExportPayload();
      if ((payload.roundHistory?.length ?? 0) === 0 && (payload.drillHistory?.length ?? 0) === 0) {
        showError('No stats to export yet');
        return;
      }

      const text = formatStatsExportText(payload);
      const fileUri = await writeStatsExportFile(text);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showError('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export golf stats',
      });
    } catch {
      showError('Failed to export stats');
    } finally {
      setExporting(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, landscapePadding, { flexGrow: 1 }]}
        bounces={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
      >
        <PageHeader
          title="Settings"
          centered
          onBack={() => router.back()}
          rightAction={
            <TouchableOpacity
              testID="settings-info-button"
              accessibilityRole="button"
              accessibilityLabel="Show help"
              onPress={handleShowOnboarding}
              style={styles.settingsSheet.circleButton}
            >
              <MaterialIcons name="info-outline" size={24} color={colours.black} />
            </TouchableOpacity>
          }
        />

        <GolfSettings
          settings={settings}
          onScoreOnlyModeChange={handleScoreOnlyModeChange}
          onBadHoleReassuranceChange={handleBadHoleReassuranceChange}
        />

        <SystemSettings
          settings={settings}
          onNotificationsChange={handleNotificationsChange}
          onSoundsChange={handleSoundsChange}
          onVoiceChange={handleVoiceChange}
          onUnitsChange={handleUnitsChange}
        />

        <SettingsFooter
          onExportStats={handleExportStats}
          exporting={exporting}
          onRateApp={openStoreReviewService}
        />
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Settings"
        steps={ONBOARDING_STEPS.settings}
      />
    </GestureHandlerRootView >
  );
}
