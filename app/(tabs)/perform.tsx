import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import DeadlySinsSection from '../../components/DeadlySinsSection';
import PuttingStatsSection from '../../components/PuttingStatsSection';
import UpAndDownSection from '../../components/UpAndDownSection';
import ProximitySection from '../../components/ProximitySection';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useFakeRefresh } from '../../hooks/useFakeRefresh';
import { useSectionTransition } from '../../hooks/useSectionTransition';
import { useToggle } from '../../hooks/useToggle';
import { logEvent } from '../../service/FirebaseService';
import { getSettingsService, saveSettingsService, AppSettings, getAllRoundHistoryService } from '../../service/DbService';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';
import RoundFilterBar from '../../components/RoundFilterBar';
import { RoundFilter, applyRoundFilter, getAvailableYears, isAllFilter } from '../../utils/roundFilter';

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [roundsFilter, setRoundsFilter] = useState<RoundFilter>('all');
  const [proximityThreePuttOnly, , setProximityThreePuttOnly] = useToggle(false);
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [showOnboarding, , setShowOnboarding] = useToggle(!settings.performOnboardingSeen);
  const [roundHistory, setRoundHistory] = useState(() => getAllRoundHistoryService());

  const SECTION_ORDER = ['sins', 'putting', 'proximity'];
  const {
    section,
    displaySection,
    handleSubMenu,
    fadeAnim: sectionFadeAnim,
    slideAnim: sectionSlideAnim
  } = useSectionTransition(SECTION_ORDER);

  const refreshHistoryData = useCallback(() => {
    setRoundHistory(getAllRoundHistoryService());
    setSettings(getSettingsService());
  }, []);

  // Pull-to-refresh reloads data but keeps the sub-menu the user is on
  const { refreshing, onRefresh } = useFakeRefresh(refreshHistoryData);
  const router = useRouter();
  const startRound = () => router.push('/play');

  useFocusEffect(refreshHistoryData);
  // Exclude score-only and incomplete rounds from performance stats
  const completedRounds = roundHistory.filter(r => r.IsScoreOnly === 0 && r.IsCompleted === 1);
  const filteredRoundHistory = applyRoundFilter(completedRounds, roundsFilter);
  const filteredRoundIds = new Set(filteredRoundHistory.map(r => r.Id));
  const roundIdsFilter = isAllFilter(roundsFilter) ? undefined : filteredRoundIds;
  const availableYears = getAvailableYears(completedRounds);

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const updated: AppSettings = { ...settings, performOnboardingSeen: true };
    setSettings(updated);
    await saveSettingsService(updated);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };


  const handleSubMenuWithLogging = (sectionName: string) => {
    handleSubMenu(sectionName);
    if (sectionName === 'sins') logEvent('view_deadly_sins');
    if (sectionName === 'putting') logEvent('view_putting');
    if (sectionName === 'proximity') logEvent('view_proximity');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubMenu showSubMenu='perform' selectedItem={section} handleSubMenu={handleSubMenuWithLogging} />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colours.primary} />
      }>

        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help"
                testID="perform-info-button"
                onPress={handleShowOnboarding}
                style={{ padding: 4 }}
              >
                <MaterialIcons name="info-outline" size={24} color={colours.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerText, styles.marginTop]}>
                Performance
              </Text>
            </View>
          </View>
        </View>

        {/* Filter buttons */}
        {completedRounds.length > 0 && (
          <RoundFilterBar value={roundsFilter} onChange={setRoundsFilter} years={availableYears} />
        )}

        {displaySection('sins') && (
          <DeadlySinsSection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            roundsFilter={roundsFilter}
            filteredRoundIds={filteredRoundIds}
            onStartRound={startRound}
          />
        )}

        {displaySection('putting') && (
          <PuttingStatsSection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            filteredRoundIds={roundIdsFilter}
            onStartRound={startRound}
          />
        )}

        {displaySection('proximity') && (
          <UpAndDownSection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            filteredRoundIds={roundIdsFilter}
          />
        )}

        {displaySection('proximity') && (
          <ProximitySection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            proximityThreePuttOnly={proximityThreePuttOnly}
            onProximityFilterChange={setProximityThreePuttOnly}
            filteredRoundIds={roundIdsFilter}
            onStartRound={startRound}
          />
        )}
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Performance"
        steps={ONBOARDING_STEPS.perform}
      />
    </GestureHandlerRootView>
  )
};
