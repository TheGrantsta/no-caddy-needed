import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import { useFakeRefresh } from "@/hooks/useFakeRefresh";
import { useSectionTransition } from "@/hooks/useSectionTransition";
import { useToggle } from "@/hooks/useToggle";
import SubMenu from "@/components/SubMenu";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllDrillHistoryService, getSettingsService, saveSettingsService } from "@/service/DbService";
import { logEvent } from "@/service/FirebaseService";
import PracticeChallengesSection from "@/components/PracticeChallengesSection";
import PracticeToolsSection from "@/components/PracticeToolsSection";
import DrillHistorySection from "@/components/DrillHistorySection";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const ONBOARDING_STEPS = [
  { text: 'Practise with purpose — use challenges and tools to sharpen your game.' },
  { text: 'Try the tools section for tempo training and random shot selection to keep your practice varied.' },
  { text: 'Check your history to track results over time and spot areas for improvement.' },
];

const ITEMS_PER_BATCH = 10;

export default function Practice() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const { section: requestedSection, t } = useLocalSearchParams<{ section?: string; t?: string }>();
  const [showOnboarding, setShowOnboarding] = useState(() => !getSettingsService().practiceOnboardingSeen);
  const [loading, setLoading] = useState(true);
  const [allDrillHistory, setAllDrillHistory] = useState<any[]>([]);
  const [displayedDrillHistory, setDisplayedDrillHistory] = useState<any[]>([]);
  const [isLoadingMore, , setIsLoadingMore] = useToggle(false);

  const SECTION_ORDER = ['challenges', 'tools', 'history'] as const;
  const {
    section,
    displaySection,
    handleSubMenu,
    fadeAnim: sectionFadeAnim,
    slideAnim: sectionSlideAnim
  } = useSectionTransition(SECTION_ORDER);

  const { refreshing, onRefresh } = useFakeRefresh(() => fetchData());

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
    } catch (e) {
      console.error("Error fetching drill history:", e);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (requestedSection && SECTION_ORDER.includes(requestedSection as typeof SECTION_ORDER[number])) {
      handleSubMenuWithLogging(requestedSection as typeof SECTION_ORDER[number]);
    }
  }, [requestedSection, t, handleSubMenuWithLogging, SECTION_ORDER]);

  const refreshHistoryData = useCallback(() => {
    fetchData();
  }, []);

  useFocusEffect(refreshHistoryData);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <SubMenu showSubMenu='practice' selectedItem={section} handleSubMenu={handleSubMenuWithLogging} />

      {refreshing && (
        <View style={styles.updateOverlay}>
          <Text style={styles.updateText}>
            Release to update
          </Text>
        </View>
      )}

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
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <TouchableOpacity
                testID="info-button"
                onPress={handleShowOnboarding}
              >
                <MaterialIcons name="info-outline" size={24} color={colours.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerText, styles.marginTop]}>
                Practice
              </Text>
            </View>
            <Text style={[styles.normalText, styles.marginBottom]}>
              Making practice time effective
            </Text>
          </View>
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
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView >
  )
};

