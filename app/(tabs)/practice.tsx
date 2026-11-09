import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocalSearchParams, useFocusEffect, useRouter } from "expo-router";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import { useFakeRefresh } from "@/hooks/useFakeRefresh";
import { useSectionTransition } from "@/hooks/useSectionTransition";
import { useToggle } from "@/hooks/useToggle";
import SubMenu from "@/components/SubMenu";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllDrillHistoryService, getPracticeRemindersService, getSettingsService, saveSettingsService } from "@/service/DbService";
import { logEvent } from "@/service/FirebaseService";
import PracticeChallengesSection from "@/components/PracticeChallengesSection";
import PracticeToolsSection from "@/components/PracticeToolsSection";
import DrillHistorySection from "@/components/DrillHistorySection";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';

const ITEMS_PER_BATCH = 10;
const SECTION_ORDER: string[] = ['challenges', 'tools', 'history'];

export default function Practice() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const { section: requestedSection, t } = useLocalSearchParams<{ section?: string; t?: string }>();
  const [showOnboarding, setShowOnboarding] = useState(() => !getSettingsService().practiceOnboardingSeen);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [allDrillHistory, setAllDrillHistory] = useState<any[]>([]);
  const [overdueReminderCount, setOverdueReminderCount] = useState(0);
  const router = useRouter();
  const [displayedDrillHistory, setDisplayedDrillHistory] = useState<any[]>([]);
  const [isLoadingMore, , setIsLoadingMore] = useToggle(false);
  const {
    section,
    displaySection,
    handleSubMenu,
    fadeAnim: sectionFadeAnim,
    slideAnim: sectionSlideAnim
  } = useSectionTransition(SECTION_ORDER);

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const currentSettings = getSettingsService();
    await saveSettingsService({ ...currentSettings, practiceOnboardingSeen: true });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleSubMenuWithLogging = React.useCallback((sectionName: string) => {
    handleSubMenu(sectionName);
    if (sectionName === 'challenges') logEvent('view_challenges');
    if (sectionName === 'tools') logEvent('view_tools');
    if (sectionName === 'history') logEvent('view_history');
  }, [handleSubMenu]);

  const fetchData = () => {
    try {
      const items = getAllDrillHistoryService();
      setAllDrillHistory(items);
      setDisplayedDrillHistory(items.slice(0, ITEMS_PER_BATCH));
      const now = new Date();
      setOverdueReminderCount(getPracticeRemindersService().filter(r => new Date(r.ScheduledFor) < now).length);
      setLoadFailed(false);
    } catch (e) {
      console.error("Error fetching drill history:", e);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Pull-to-refresh reloads the drill history (fetchData is declared above)
  const { refreshing, onRefresh } = useFakeRefresh(() => fetchData());

  const loadMoreItems = () => {
    if (isLoadingMore || displayedDrillHistory.length >= allDrillHistory.length) {
      return;
    }

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch = displayedDrillHistory.length + ITEMS_PER_BATCH;
      setDisplayedDrillHistory(allDrillHistory.slice(0, nextBatch));
      setIsLoadingMore(false);
    }, 100);
  };

  // Mount-time load from SQLite; there is no external change to subscribe to.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Sync the section to a route parameter whenever it changes; the route is an external source.
  useEffect(() => {
    if (requestedSection && SECTION_ORDER.includes(requestedSection as typeof SECTION_ORDER[number])) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubMenuWithLogging(requestedSection as typeof SECTION_ORDER[number]);
    }
  }, [requestedSection, t, handleSubMenuWithLogging]);

  const refreshHistoryData = useCallback(() => {
    fetchData();
  }, []);

  useFocusEffect(refreshHistoryData);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colours.primary} />
        }
      >

        <View style={styles.container}>
          {overdueReminderCount > 0 && (
            <TouchableOpacity
              testID="overdue-reminder-banner"
              onPress={() => router.push('/tools/reminders')}
              style={{ marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colours.red }}
            >
              <Text style={{ color: colours.text, fontWeight: '600' }}>You have an overdue practice reminder</Text>
              <Text style={{ color: colours.primary, fontWeight: '600', marginTop: 4 }}>View reminders</Text>
            </TouchableOpacity>
          )}
          <View testID="practice-title-row" style={styles.practiceHeader.titleRow}>
            <Text style={styles.practiceHeader.title}>Practice</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help"
              testID="info-button"
              onPress={handleShowOnboarding}
              style={styles.practiceHeader.circleButton}
            >
              <MaterialIcons name="info-outline" size={22} color={colours.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.practiceHeader.subtitle}>Making practice time effective</Text>
          <SubMenu showSubMenu='practice' selectedItem={section} handleSubMenu={handleSubMenuWithLogging} variant="pill" />
        </View>

        {displaySection('challenges') && (
          <PracticeChallengesSection fadeAnim={sectionFadeAnim} slideAnim={sectionSlideAnim} />
        )}

        {displaySection('tools') && (
          <PracticeToolsSection fadeAnim={sectionFadeAnim} slideAnim={sectionSlideAnim} />
        )}

        {displaySection('history') && (
          <DrillHistorySection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            loading={loading}
            loadFailed={loadFailed}
            allDrillHistory={allDrillHistory}
            displayedDrillHistory={displayedDrillHistory}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMoreItems}
          />
        )}
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Practice"
        steps={ONBOARDING_STEPS.practice}
      />
    </GestureHandlerRootView >
  )
};

