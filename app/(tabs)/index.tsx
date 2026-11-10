import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';
import { useStyles } from '@/hooks/useStyles';
import { useOrientation } from '@/hooks/useOrientation';
import { getAllRoundHistoryService, getSettingsService, saveSettingsService } from '@/service/DbService';
import { buildRecentItems, RecentItem } from '@/utils/homeRecent';
import HomeHeader from '@/components/HomeHeader';
import HomeHero from '@/components/HomeHero';
import HomeQuickTools from '@/components/HomeQuickTools';
import HomeRecent from '@/components/HomeRecent';
import HomeGolfSimplified from '@/components/HomeGolfSimplified';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import AcknowledgeOverlay from '@/components/AcknowledgeOverlay';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

// What's new for the current version — shown once per version to existing users.
const WHATS_NEW = [
  'Track your pre-shot routine when entering scores for faster scoring',
  'Challenges help you focus on short-game skills that matter most',
  'Smoother transitions between play tracking, practice, and performance review',
];

const APP_VERSION = Constants.expoConfig?.version ?? '';

export default function HomeScreen() {
  const styles = useStyles();
  const { landscapePadding } = useOrientation();
  const settings = getSettingsService();
  const [showOnboarding, setShowOnboarding] = useState(!settings.homeOnboardingSeen);
  // Existing users (already past onboarding) see "What's new" once per version.
  const [showWhatsNew, setShowWhatsNew] = useState(
    settings.homeOnboardingSeen && settings.whatsNewVersionSeen !== APP_VERSION
  );
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Reloads the Recent list each time the Home tab is shown, so new rounds and drills appear
  useFocusEffect(
    useCallback(() => {
      setRecentItems(buildRecentItems(getAllRoundHistoryService(), new Date()));
    }, [])
  );


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

  return (
    <GestureHandlerRootView style={[styles.flexOne]}>
      <ScrollView
        style={[styles.scrollContainer]}
        contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
      >
        <HomeHeader />

        <HomeHero />

        <HomeQuickTools />

        <HomeRecent items={recentItems} />

        <View style={{ marginTop: 16 }}>
          <HomeGolfSimplified />
        </View>

      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="No Caddy Needed"
        steps={ONBOARDING_STEPS.home}
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
