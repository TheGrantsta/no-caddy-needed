import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { useFakeRefresh } from '@/hooks/useFakeRefresh';
import { getSettingsService, saveSettingsService } from '@/service/DbService';
import HomeHeader from '@/components/HomeHeader';
import HomeIntro from '@/components/HomeIntro';
import HomeNavigation from '@/components/HomeNavigation';
import HomeGolfSimplified from '@/components/HomeGolfSimplified';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import AcknowledgeOverlay from '@/components/AcknowledgeOverlay';

const ONBOARDING_STEPS = [
  { text: 'Welcome to No Caddy Needed — your personal golf companion for smarter play, practice and performance.' },
  { text: 'Use the Play, Practice and Performance sections to track rounds, sharpen your short game and review your stats.' },
  { text: 'Pull down to refresh at any time. Tap the info icon to see this guide again.' },
];

// What's new for the current version — shown once per version to existing users.
const WHATS_NEW = [
  'Smoother screen transitions when switching between Play, Practice and Performance sections',
  'Show pre-shot routine when entering scores',
  'Improved wind direction layout and distance entry',
];

const APP_VERSION = Constants.expoConfig?.version ?? '';

export default function HomeScreen() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const settings = getSettingsService();
  const [showOnboarding, setShowOnboarding] = useState(!settings.homeOnboardingSeen);
  // Existing users (already past onboarding) see "What's new" once per version.
  const [showWhatsNew, setShowWhatsNew] = useState(
    settings.homeOnboardingSeen && settings.whatsNewVersionSeen !== APP_VERSION
  );

  const { refreshing, onRefresh } = useFakeRefresh(() => {});

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const currentSettings = getSettingsService();
    // Mark the current version's "What's new" as seen too, so new users aren't shown it straight after onboarding.
    await saveSettingsService({ ...currentSettings, homeOnboardingSeen: true, whatsNewVersionSeen: APP_VERSION });
  };

  const handleDismissWhatsNew = async () => {
    setShowWhatsNew(false);
    const currentSettings = getSettingsService();
    await saveSettingsService({ ...currentSettings, whatsNewVersionSeen: APP_VERSION });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <GestureHandlerRootView style={[styles.flexOne]}>
      {refreshing && (
        <View style={styles.updateOverlay}>
          <Text style={styles.updateText}>Release to update</Text>
        </View>
      )}
      <ScrollView
        style={[styles.scrollContainer]}
        contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.primary} />
        }
      >
        <HomeHeader onInfoPress={handleShowOnboarding} />

        <HomeIntro />

        <HomeNavigation />

        <HomeGolfSimplified />

      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="No Caddy Needed"
        steps={ONBOARDING_STEPS}
      />

      <AcknowledgeOverlay
        visible={showWhatsNew}
        title="What's new"
        text={WHATS_NEW.map((c) => `•  ${c}`).join('\n\n')}
        textAlign="left"
        onDismiss={handleDismissWhatsNew}
      />
    </GestureHandlerRootView>
  );
}
