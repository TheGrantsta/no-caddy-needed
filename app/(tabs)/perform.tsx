import { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import DeadlySinsSection from '../../components/DeadlySinsSection';
import PuttingStatsSection from '../../components/PuttingStatsSection';
import ProximitySection from '../../components/ProximitySection';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { useFakeRefresh } from '../../hooks/useFakeRefresh';
import { useSectionTransition } from '../../hooks/useSectionTransition';
import { useToggle } from '../../hooks/useToggle';
import { logEvent } from '../../service/FirebaseService';
import { getSettingsService, saveSettingsService, AppSettings, getAllRoundHistoryService } from '../../service/DbService';

const ONBOARDING_STEPS = [
  { text: 'Performance helps you make smarter decisions and set realistic expectations on the course.' },
  { text: 'The Deadly Sins tab tracks your 7 Deadly Sins across rounds, with tap-through trends for each one.' },
  { text: 'Putting and Proximity tabs show your personal statistics and how you compare to the tour.' },
];

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [roundsFilter, setRoundsFilter] = useState<1 | 10 | 'all'>('all');
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

  const { refreshing, onRefresh } = useFakeRefresh(() => {
    handleSubMenu('sins');
  });

  const refreshHistoryData = useCallback(() => {
    setRoundHistory(getAllRoundHistoryService());
    setSettings(getSettingsService());
  }, []);

  useFocusEffect(refreshHistoryData);
  const filteredRoundHistory = roundsFilter === 'all' ? roundHistory : roundHistory.slice(0, roundsFilter);
  const filteredRoundIds = new Set(filteredRoundHistory.map(r => r.Id));
  const roundIdsFilter = roundsFilter === 'all' ? undefined : filteredRoundIds;

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

      {refreshing && (
        <View style={styles.updateOverlay}>
          <Text style={styles.updateText}>
            Release to update
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colours.primary} />
      }>

        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <TouchableOpacity
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
        {roundHistory.length > 0 && (
          <View style={[styles.playScreen.filterContainer, { paddingVertical: 12 }]}>
            {([1, 10, 'all'] as const).map(f => (
              <TouchableOpacity
                key={String(f)}
                testID={`filter-button-${f}`}
                onPress={() => setRoundsFilter(f)}
                style={[styles.playScreen.filterButton, roundsFilter === f && styles.playScreen.filterButtonSelected]}
              >
                <Text style={[styles.playScreen.filterButtonText, roundsFilter === f && styles.playScreen.filterButtonTextSelected]}>
                  {f === 'all' ? 'All' : String(f)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {displaySection('sins') && (
          <DeadlySinsSection
            fadeAnim={sectionFadeAnim}
            slideAnim={sectionSlideAnim}
            roundsFilter={roundsFilter}
            filteredRoundIds={filteredRoundIds}
          />
        )}

        {displaySection('putting') && (
          <PuttingStatsSection
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
          />
        )}
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Performance"
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView>
  )
};
