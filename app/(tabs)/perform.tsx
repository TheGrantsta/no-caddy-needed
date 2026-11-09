import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import SubMenu from '../../components/SubMenu';
import PageHeader from '../../components/PageHeader';
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
import { getSettingsService, saveSettingsService, AppSettings, getAllRoundHistoryService, getParAveragesService } from '../../service/DbService';
import RoundHistorySection from '../../components/RoundHistorySection';
import { ONBOARDING_STEPS } from '@/assets/onboardingSteps';
import RoundFilterBar from '../../components/RoundFilterBar';
import { applyRoundFilter, getAvailableYears, resolveRoundFilter } from '../../utils/roundFilter';
import { useRoundFilter } from '../../hooks/useRoundFilter';

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  // Shared with Play; the effective filter is derived below once round history is loaded
  const [storedRoundsFilter, setRoundsFilter] = useRoundFilter();
  const [proximityThreePuttOnly, , setProximityThreePuttOnly] = useToggle(false);
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [showOnboarding, , setShowOnboarding] = useToggle(!settings.performOnboardingSeen);
  const [roundHistory, setRoundHistory] = useState(() => getAllRoundHistoryService());
  const roundsFilter = resolveRoundFilter(storedRoundsFilter, getAvailableYears(roundHistory));

  const SECTION_ORDER = ['sins', 'putting', 'proximity', 'rounds'];
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
  // The filter selects from every round (same as Play). Score-only and incomplete rounds
  // are then dropped, because only completed stats rounds have sins, putting and proximity data.
  const filteredRoundHistory = applyRoundFilter(roundHistory, roundsFilter);
  const filteredRoundIds = new Set(
    filteredRoundHistory.filter(r => r.IsScoreOnly === 0 && r.IsCompleted === 1).map(r => r.Id)
  );
  const availableYears = getAvailableYears(roundHistory);

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
          <PageHeader
            title="Stats"
            rightAction={
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help"
                testID="perform-info-button"
                onPress={handleShowOnboarding}
                style={{ padding: 4 }}
              >
                <MaterialIcons name="info-outline" size={24} color={colours.primary} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Filter buttons */}
        {roundHistory.length > 0 && (
          <View style={styles.container}>
            <RoundFilterBar value={roundsFilter} onChange={setRoundsFilter} years={availableYears} />
          </View>
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
            filteredRoundIds={filteredRoundIds}
            onStartRound={startRound}
          />
        )}

        {displaySection('proximity') && (
          <UpAndDownSection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            filteredRoundIds={filteredRoundIds}
          />
        )}

        {displaySection('proximity') && (
          <ProximitySection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            proximityThreePuttOnly={proximityThreePuttOnly}
            onProximityFilterChange={setProximityThreePuttOnly}
            filteredRoundIds={filteredRoundIds}
            onStartRound={startRound}
          />
        )}

        {displaySection('rounds') && (
          <RoundHistorySection
            rounds={filteredRoundHistory}
            parAverages={getParAveragesService(filteredRoundHistory)}
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
          />
        )}
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Stats"
        steps={ONBOARDING_STEPS.perform}
      />
    </GestureHandlerRootView>
  )
};
