import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, RefreshControl } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import Chevrons from '../../components/Chevrons';
import SubMenu from '../../components/SubMenu';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import PuttingProximityChart from '../../components/PuttingProximityChart';
import DeadlySinsChart from '../../components/DeadlySinsChart';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import { logEvent } from '../../service/FirebaseService';
import { getSettingsService, saveSettingsService, AppSettings, getPuttingMakeRatesService, getPuttingProximityService, getAllDeadlySinsRoundsService, getAllRoundHistoryService } from '../../service/DbService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  { text: 'Performance helps you make smarter decisions and set realistic expectations on the course.' },
  { text: 'The Deadly Sins tab tracks your 7 Deadly Sins across rounds, with tap-through trends for each one.' },
  { text: 'The Pro stats tab shows tour-level proximity and putting make rates so you can manage your expectations.' },
];

export default function Perform() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('sins');
  const [activeIndex, setActiveIndex] = useState(0);
  const [sinsFilter, setSinsFilter] = useState<1 | 10 | 'all'>('all');
  const flatListRef = useRef(null);
  const [settings, setSettings] = useState<AppSettings>(getSettingsService());
  const [showOnboarding, setShowOnboarding] = useState(!settings.performOnboardingSeen);

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const updated: AppSettings = { ...settings, performOnboardingSeen: true };
    setSettings(updated);
    await saveSettingsService(updated);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const points = ['Target: play for your shot dispersion', 'Aim: think shotgun pattern', 'Strategy: favour the "fat" side', 'Eliminate:  big numbers by playing away from water & severe hazards'];

  const getApproachShotStats = () => {
    const approachStats: any[] = [];

    approachStats.push(['Yards', 'Fairway', 'Rough']);
    approachStats.push(['225-250', '44\'10"', '56\'2"']);
    approachStats.push(['200-225', '42\'5"', '54\'6"']);
    approachStats.push(['175-200', '34\'1"', '44\'8"']);
    approachStats.push(['150-175', '27\'8"', '33\'4"']);
    approachStats.push(['125-150', '23\'6"', '37\'9"']);
    approachStats.push(['100-125', '20\'3"', '32\'9"']);
    approachStats.push(['75-100', '17\'9"', '27\'8"']);
    approachStats.push(['50-75', '15\'11"', '24\'6"']);

    return approachStats;
  };

  const getPuttingStats = () => {
    const puttingStats: any[] = [];

    puttingStats.push(['Feet', 'Make rate']);
    puttingStats.push(['1', '100%']);
    puttingStats.push(['2', '99%']);
    puttingStats.push(['3', '95%']);
    puttingStats.push(['4', '86%']);
    puttingStats.push(['5', '75%']);
    puttingStats.push(['6', '65%']);
    puttingStats.push(['7', '56%']);
    puttingStats.push(['8', '49%']);
    puttingStats.push(['9', '43%']);
    puttingStats.push(['10', '38%']);
    puttingStats.push(['15', '22%']);
    puttingStats.push(['20', '14%']);
    puttingStats.push(['25', '10%']);
    puttingStats.push(['30', '7%']);
    puttingStats.push(['35', '5%']);
    puttingStats.push(['Inflection point: more likely to 3 putt'])
    puttingStats.push(['40', '3%']);
    puttingStats.push(['45', '2%']);
    puttingStats.push(['50', '1%']);

    return puttingStats;
  };

  const PUTTING_PRO_RATES: Record<number, string> = {
    1: '100%*', 2: '99%*', 3: '99%', 4: '91%', 5: '81%', 6: '70%', 7: '61%', 8: '53%', 9: '46%', 10: '41%',
    11: '37%*', 12: '33%*', 13: '31%*', 14: '28%*', 15: '25%*', 16: '23%*', 17: '21%*', 18: '19%*', 19: '18%*', 20: '16%*',
    25: '10%*', 30: '7%*', 35: '5%*', 40: '3%*', 45: '2%*', 50: '1%*',
  };

  const getPersonalPuttingStats = (): [string, string][] => {
    const rates = getPuttingMakeRatesService();
    return rates.map((row) => [
      String(row.distance),
      `${row.firstPuttMakeRate} (${PUTTING_PRO_RATES[row.distance] || '-'})`,
    ]);
  };

  const proStats: any[] = [];
  proStats.push(getApproachShotStats());
  proStats.push(getPuttingStats());

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
    if (sectionName === 'approach') logEvent('view_approach');
    if (sectionName === 'pros') logEvent('view_pro_stats');
    if (sectionName === 'putting') logEvent('view_putting');
    if (sectionName === 'proximity') logEvent('view_proximity');
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderItem = useCallback(({ item }: any) => (
    <ScrollView style={[styles.container, styles.scrollWrapper, { maxHeight: 350, overflow: 'hidden' }]}>
      {item.map((row: any, rowIndex: number) => (
        <View key={rowIndex} style={[styles.row, { width: SCREEN_WIDTH * 0.9 }]}>
          {row.map((cell: any, colIndex: number) => (
            <View key={colIndex} style={{
              flex: 1, padding: 3, alignItems: "center", justifyContent: "center",
            }}>
              <Text style={[rowIndex === 0 ? [styles.normalText, { fontWeight: 'bold' }] : styles.normalText, { padding: 5 }]}>
                {cell}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  ), [styles]);

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

        {/* Deadly Sins */}
        {displaySection('sins') && (() => {
          const roundHistory = getAllRoundHistoryService();
          const deadlySinsRounds = getAllDeadlySinsRoundsService();
          const filteredRoundHistory = sinsFilter === 'all' ? roundHistory : roundHistory.slice(0, sinsFilter);
          const filteredRoundIds = new Set(filteredRoundHistory.map(r => r.Id));
          const filteredDeadlySinsRounds = sinsFilter === 'all'
              ? deadlySinsRounds
              : deadlySinsRounds.filter(r => r.RoundId != null && filteredRoundIds.has(r.RoundId as number));

          return (
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
                    Deadly Sins
                  </Text>
                </View>
                <Text style={[styles.normalText, styles.marginBottom]}>
                  Track your 7 Deadly Sins across rounds
                </Text>
              </View>

              <View style={styles.divider} />

              {roundHistory.length > 0 && (
                <View style={styles.playScreen.filterContainer}>
                  <Text testID="filter-label" style={styles.playScreen.filterLabel}>Show</Text>
                  {([1, 10, 'all'] as const).map(f => (
                    <TouchableOpacity
                      key={String(f)}
                      testID={`filter-button-${f}`}
                      onPress={() => setSinsFilter(f)}
                      style={[styles.playScreen.filterButton, sinsFilter === f && styles.playScreen.filterButtonSelected]}
                    >
                      <Text style={[styles.playScreen.filterButtonText, sinsFilter === f && styles.playScreen.filterButtonTextSelected]}>
                        {f === 'all' ? 'All' : String(f)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <DeadlySinsChart rounds={filteredDeadlySinsRounds} filter={sinsFilter} />
            </View>
          );
        })()}

        {/* Approach */}
        {displaySection('approach') && (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.headerText, styles.marginTop]}>
                  Approach shots
                </Text>
              </View>
              <Text style={[styles.normalText, styles.marginBottom]}>
                Make better on course decisions & choose better targets
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.contentSection}>
              <Chevrons heading='Concepts' points={points} />
            </View>

            <Text style={[styles.normalText, styles.marginTop, { padding: 10 }]}>
              * Your dispersion changes with different clubs and swing types — know your tendencies for full and partial shots
            </Text>
          </View>
        )}

        {/* Pros stats */}
        {displaySection('pros') && (
          <View>
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    Performance
                  </Text>
                </View>
                <Text style={[styles.normalText, styles.marginBottom]}>
                  Manage your expectations, better!
                </Text>
              </View>

              <View style={styles.divider} />

              {activeIndex === 0 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    Approach shots
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    Average proximity to the hole
                  </Text>
                </View>
              )}

              {activeIndex === 1 && (
                <View>
                  <Text style={[styles.headerText, styles.marginTop]}>
                    Putts
                  </Text>
                  <Text style={[styles.normalText, styles.marginBottom]}>
                    Professional male golfer make percentages
                  </Text>
                </View>
              )}

              <View style={styles.horizontalScrollContainer}>
                <FlatList
                  testID='perform-flat-list'
                  ref={flatListRef}
                  data={proStats}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={renderItem}
                />
              </View>
            </View>

            <View style={styles.scrollIndicatorContainer}>
              {proStats.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.scrollIndicatorDot,
                    activeIndex === index && styles.scrollActiveDot,
                  ]}
                />
              ))}
            </View>

            {activeIndex === 0 && (
              <View>
                <Text style={[styles.smallestText, styles.marginBottom]}>
                  Source: PGA tour online statistics website
                </Text>
              </View>
            )}

            {activeIndex === 1 && (
              <View>
                <Text style={[styles.smallestText, styles.marginBottom]}>
                  Source:
                  <Text style={{ fontStyle: 'italic' }}>
                    The Lost Art of Putting: Introducing the Six Putting Performance Principles
                  </Text> by Gary Nicol & Karl Morris
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Putting */}
        {displaySection('putting') && (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.headerText, styles.marginTop]}>
                  Putting
                </Text>
              </View>
              <Text style={[styles.normalText, styles.marginBottom]}>
                Your personal putting make rates
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.clubDistanceList.container}>
              <View style={styles.clubDistanceList.headerRow}>
                <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.clubCell]}>
                  <Text style={styles.clubDistanceList.headerCell}>Feet</Text>
                </View>
                <View style={[styles.clubDistanceList.headerCell, styles.clubDistanceList.distanceCell]}>
                  <Text style={styles.clubDistanceList.headerCell}>Make rate</Text>
                </View>
              </View>
              {getPersonalPuttingStats().map(([distance, rate], index, rows) => (
                <View key={distance} style={[styles.clubDistanceList.row, index === rows.length - 1 && { borderBottomWidth: 0.5 }]}>
                  <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.clubCell, { textAlign: 'center', }]}>{distance}</Text>
                  <Text style={[styles.clubDistanceList.cell, styles.clubDistanceList.distanceCell]}>{rate}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.smallestText, styles.marginBottom, { paddingHorizontal: 16, marginTop: 12 }]}>
              * Estimated or extrapolated from PGA tour data
            </Text>
          </View>
        )}

        {displaySection('proximity') && (
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.headerText, styles.marginTop]}>
                  Proximity
                </Text>
              </View>
              <Text style={[styles.normalText, styles.marginBottom]}>
                Where your missed first putts finish
              </Text>
            </View>

            <View style={styles.divider} />

            <PuttingProximityChart data={getPuttingProximityService()} />
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
