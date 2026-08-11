import { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import PuttingProximityChart from '../../components/PuttingProximityChart';
import DeadlySinsChart from '../../components/DeadlySinsChart';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { logEvent } from '../../service/FirebaseService';
import { getSettingsService, saveSettingsService, AppSettings, getPuttingMakeRatesService, getPuttingProximityService, getAllDeadlySinsRoundsService, getAllRoundHistoryService } from '../../service/DbService';

const ONBOARDING_STEPS = [
  { text: 'Performance helps you make smarter decisions and set realistic expectations on the course.' },
  { text: 'The Deadly Sins tab tracks your 7 Deadly Sins across rounds, with tap-through trends for each one.' },
  { text: 'Putting and Proximity tabs show your personal statistics and how you compare to the tour.' },
];

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('sins');
  const [roundsFilter, setRoundsFilter] = useState<1 | 10 | 'all'>('all');
  const [proximityThreePuttOnly, setProximityThreePuttOnly] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [showOnboarding, setShowOnboarding] = useState(!settings.performOnboardingSeen);

  const roundHistory = getAllRoundHistoryService();
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

  const PUTTING_PRO_RATES: Record<number, string> = {
    1: '100%*', 2: '99%*', 3: '99%', 4: '91%', 5: '81%', 6: '70%', 7: '61%', 8: '53%', 9: '46%', 10: '41%',
    11: '37%*', 12: '33%*', 13: '31%*', 14: '28%*', 15: '25%*', 16: '23%*', 17: '21%*', 18: '19%*', 19: '18%*', 20: '16%*',
    25: '10%*', 30: '7%*', 35: '5%*', 40: '3%*', 45: '2%*', 50: '1%*',
  };

  const getPersonalPuttingStats = (roundIds?: Set<number>): [string, string][] => {
    const rates = getPuttingMakeRatesService(roundIds);
    return rates.map((row) => [
      String(row.distance),
      `${row.makeRate} (${PUTTING_PRO_RATES[row.distance] || '-'})`,
    ]);
  };

  const hasPersonalPuttingData = (roundIds?: Set<number>): boolean => {
    const rates = getPuttingMakeRatesService(roundIds);
    return rates.some((row) => row.makeRate !== '-');
  };

  const hasProximityData = (threePuttOnly: boolean, roundIds?: Set<number>): boolean => {
    const proximity = getPuttingProximityService(threePuttOnly, roundIds);
    return proximity.length > 0 && proximity.some((row) => row.shortPercent !== '-' || row.longPercent !== '-');
  };

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setSection('sins');
      setRefreshing(false);
    }, 750);
  };

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
    if (sectionName === 'sins') logEvent('view_deadly_sins');
    if (sectionName === 'putting') logEvent('view_putting');
    if (sectionName === 'proximity') logEvent('view_proximity');
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SubMenu showSubMenu='perform' selectedItem={section} handleSubMenu={handleSubMenu} />

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

        {/* Show Filter with Info Button */}
        <View style={[styles.playScreen.filterContainer, { paddingVertical: 12 }]}>
          <TouchableOpacity
            testID="perform-info-button"
            onPress={handleShowOnboarding}
            style={{ padding: 4 }}
          >
            <MaterialIcons name="info-outline" size={24} color={colours.primary} />
          </TouchableOpacity>
          <Text testID="filter-label" style={styles.playScreen.filterLabel}>Show</Text>
          {roundHistory.length > 0 && ([1, 10, 'all'] as const).map(f => (
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

        {/* Deadly Sins */}
        {displaySection('sins') && (() => {
          const deadlySinsRounds = getAllDeadlySinsRoundsService();
          const filteredDeadlySinsRounds = roundsFilter === 'all'
            ? deadlySinsRounds
            : deadlySinsRounds.filter(r => r.RoundId != null && filteredRoundIds.has(r.RoundId as number));

          return (
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text style={styles.headerText}>
                    Deadly Sins
                  </Text>
                </View>
                <Text style={[styles.normalText, styles.marginBottom]}>
                  Track your 7 Deadly Sins across rounds
                </Text>
              </View>

              <View style={styles.divider} />

              <DeadlySinsChart rounds={filteredDeadlySinsRounds} filter={roundsFilter} />
            </View>
          );
        })()}

        {/* Deadly Sins */}
        {/* Putting */}
        {displaySection('putting') && (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.headerText}>
                  Putting
                </Text>
              </View>
              <Text style={[styles.normalText, styles.marginBottom]}>
                Your personal putting make rates
              </Text>
            </View>

            <View style={styles.divider} />

            {hasPersonalPuttingData(roundIdsFilter) ? (
              <>
                <View style={styles.clubDistanceList.container}>
                  <View style={styles.clubDistanceList.headerRow}>
                    <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.clubCell]}>
                      <Text style={styles.clubDistanceList.headerCell}>Feet</Text>
                    </View>
                    <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.distanceCell]}>
                      <Text style={styles.clubDistanceList.headerCell}>Make rate</Text>
                    </View>
                  </View>
                  {getPersonalPuttingStats(roundIdsFilter).map(([distance, rate], index, rows) => (
                    <View key={distance} style={[styles.clubDistanceList.row, index === rows.length - 1 && { borderBottomWidth: 0.5 }]}>
                      <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.clubCell, { textAlign: 'center', }]}>{distance}</Text>
                      <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.distanceCell]}>{rate}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.smallestText, styles.marginBottom, { paddingHorizontal: 16, marginTop: 12 }]}>
                  * Estimated or extrapolated from PGA tour data
                </Text>
              </>
            ) : (
              <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                No putting data for selected rounds
              </Text>
            )}
          </View>
        )}

        {displaySection('proximity') && (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={styles.headerText}>
                  Proximity
                </Text>
              </View>
              <Text style={[styles.normalText, styles.marginBottom]}>
                Where your missed first putts finish
              </Text>
            </View>

            <View style={styles.divider} />

            {hasProximityData(proximityThreePuttOnly, roundIdsFilter) ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 20, gap: 8 }}>
                  <Text testID="proximity-filter-label" style={{ color: colours.primary, fontSize: 16 }}>Show 3-Putts Only</Text>
                  <Switch
                    testID="proximity-filter-toggle"
                    value={proximityThreePuttOnly}
                    onValueChange={setProximityThreePuttOnly}
                    trackColor={{ false: colours.tertiary, true: colours.primary }}
                  />
                </View>

                <PuttingProximityChart data={getPuttingProximityService(proximityThreePuttOnly, roundIdsFilter)} />
              </>
            ) : (
              <Text style={[styles.normalText, { paddingHorizontal: 16, marginTop: 12 }]}>
                No putting data for selected rounds
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="Performance guide"
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView>
  )
};
