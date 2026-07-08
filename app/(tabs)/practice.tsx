import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import SubMenu from "@/components/SubMenu";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import fontSizes from "@/assets/font-sizes";
import { getAllDrillHistoryService, getDrillStatsByTypeService, getSettingsService, saveSettingsService, DrillStats } from "@/service/DbService";
import { logEvent } from "@/service/FirebaseService";
import DrillStatsChart from "@/components/DrillStatsChart";
import Chevrons from "@/components/Chevrons";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const ONBOARDING_STEPS = [
  { text: 'Practice with purpose — use short game drills to sharpen your putting, chipping, pitching and bunker play.' },
  { text: 'Try the tools section for tempo training and random shot selection to keep your practice varied.' },
  { text: 'Check your history to track drill results over time and spot areas for improvement.' },
];

const ITEMS_PER_BATCH = 10;

export default function Practice() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const [showOnboarding, setShowOnboarding] = useState(() => !getSettingsService().practiceOnboardingSeen);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('areas');
  const [loading, setLoading] = useState(true);
  const [allDrillHistory, setAllDrillHistory] = useState<any[]>([]);
  const [displayedDrillHistory, setDisplayedDrillHistory] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const flatListRef = useRef(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedHistoryRef = useRef<any[]>([]);
  const allHistoryRef = useRef<any[]>([]);

  const points = ['Intention: practice with a purpose!', 'Evaluate: be honest with yourself - identify the shots you avoid (or can\'t play) and give yourself time to improve', 'Data: use your 7 Deadly Sins stats as a guide; focus your practice on what will make the biggest difference'];

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const currentSettings = getSettingsService();
    await saveSettingsService({ ...currentSettings, practiceOnboardingSeen: true });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleSubMenu = (sectionName: string) => {
    setSection(sectionName);
    if (sectionName === 'areas') logEvent('view_areas');
    if (sectionName === 'tools') logEvent('view_tools');
    if (sectionName === 'history') logEvent('view_history');
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const fetchData = () => {
    try {
      const items = getAllDrillHistoryService();
      allHistoryRef.current = items;
      const displayed = items.slice(0, ITEMS_PER_BATCH);
      displayedHistoryRef.current = displayed;
      setAllDrillHistory(items);
      setDisplayedDrillHistory(displayed);
    } catch (e) {
      console.error("Error fetching drill history:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreItems = () => {
    if (isLoadingMore || displayedHistoryRef.current.length >= allHistoryRef.current.length) {
      return;
    }

    setIsLoadingMore(true);
    setTimeout(() => {
      const nextBatch = displayedHistoryRef.current.length + ITEMS_PER_BATCH;
      const newDisplayed = allHistoryRef.current.slice(0, nextBatch);
      displayedHistoryRef.current = newDisplayed;
      setDisplayedDrillHistory(newDisplayed);
      setIsLoadingMore(false);
    }, 100);
  };

  const handleScroll = (event: any) => {
    if (!displaySection('history') || isLoadingMore) return;

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Check if scrolled to bottom (within 200px)
    const isNearBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y < 200;

    if (isNearBottom && displayedDrillHistory.length < allDrillHistory.length) {
      loadMoreItems();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refreshTimerRef.current = setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 750);
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  useFocusEffect(() => {
    if (section === 'history' && !refreshing && !loading) {
      fetchData();
    }
  });

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <SubMenu showSubMenu='practice' selectedItem={section} handleSubMenu={handleSubMenu} />

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
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

          <View style={styles.divider} />
        </View>

        {/* Practice areas */}
        {displaySection('areas') && (
          <View>
            <Text style={[styles.subHeaderText, styles.marginTop]}>
              Practice areas
            </Text>

            <View style={styles.navGrid}>
              <View style={styles.navRow}>
                <Link href="../areas/putting" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="adjust" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Putting</Text>
                  </View>
                </Link>
                <Link href="../areas/chipping" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="filter-tilt-shift" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Chipping</Text>
                  </View>
                </Link>
              </View>
              <View style={styles.navRow}>
                <Link href="../areas/pitching" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="golf-course" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Pitching</Text>
                  </View>
                </Link>
                <Link href="../areas/bunker" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="beach-access" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Bunker play</Text>
                  </View>
                </Link>
              </View>
              <View style={styles.navRow}>
                <Link href="../areas/full-swing" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="sports-golf" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Full swing</Text>
                  </View>
                </Link>
              </View>
            </View>

            <View style={styles.contentSection}>
              <Chevrons heading='Principles' points={points} />
            </View>
          </View>
        )}

        {/* Tools */}
        {displaySection('tools') && (
          <View>
            <Text style={[styles.subHeaderText, styles.marginTop]}>
              Practice tools
            </Text>

            <View style={styles.navGrid}>
              <View style={styles.navRow}>
                <Link href="../tools/tempo" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="music-note" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Tempo</Text>
                  </View>
                </Link>
                <Link href="../tools/random" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="shuffle-on" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Random</Text>
                  </View>
                </Link>
              </View>
              <View style={styles.navRow}>
                <Link href="../tools/reminders" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="notifications-none" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Reminders</Text>
                  </View>
                </Link>
                <Link href="../tools/wind" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="air" size={36} color={colours.white} />
                    </View>
                    <Text style={styles.navCardLabel}>Wind</Text>
                  </View>
                </Link>
              </View>
            </View>
          </View>
        )}

        {/* History */}
        {displaySection('history') && (
          <View>
            {loading ? (
              <View>
                <ActivityIndicator size="large" color={colours.primary} />
              </View>
            ) : (
              <View>
                {allDrillHistory.length === 0 && (
                  <Text style={{
                    color: colours.primary,
                    fontSize: fontSizes.subHeader,
                    padding: 6,
                    marginTop: 10
                  }}>
                    No test history yet
                  </Text>
                )}

                {allDrillHistory.length > 0 && (
                  <View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginBottom: 10, marginTop: 10 }}>
                      <Text style={[styles.subHeaderText, { flex: 0.6 }]} numberOfLines={1}>
                        Test
                      </Text>
                      <Text style={[styles.subHeaderText, { flex: 0.2, textAlign: 'center' }]} numberOfLines={1}>
                        Score
                      </Text>
                      <Text style={[styles.subHeaderText, { flex: 0.2, textAlign: 'center' }]} numberOfLines={1}>
                        Date
                      </Text>
                    </View>

                    <FlatList
                      ref={flatListRef}
                      data={displayedDrillHistory}
                      keyExtractor={(_, index) => index.toString()}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginBottom: 8 }}>
                          <Text style={[styles.cell, { textAlign: 'left', flex: 0.6, borderWidth: 0, fontWeight: 'normal' }]} numberOfLines={1}>
                            {item.Name}
                          </Text>
                          <Text style={[styles.cell, { flex: 0.2, borderWidth: 0, textAlign: 'center', fontWeight: 'normal' }]} numberOfLines={1}>
                            {item.Score ?? '—'}
                          </Text>
                          <Text style={[styles.cell, { flex: 0.2, borderWidth: 0, textAlign: 'center', fontWeight: 'normal' }]} numberOfLines={1}>
                            {item.Created_At}
                          </Text>
                        </View>
                      )}
                    />

                    {displayedDrillHistory.length < allDrillHistory.length && (
                      <View style={{ paddingVertical: 15, alignItems: 'center', gap: 10 }}>
                        {isLoadingMore && (
                          <ActivityIndicator
                            testID="infinite-scroll-loader"
                            size="small"
                            color={colours.primary}
                          />
                        )}
                        <TouchableOpacity
                          testID="load-more-button"
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderWidth: 1,
                            borderColor: colours.primary,
                            borderRadius: 8,
                          }}
                          onPress={loadMoreItems}
                          disabled={isLoadingMore}
                        >
                          <Text style={{ color: colours.primary, fontSize: 14, fontWeight: '500' }}>
                            {isLoadingMore ? 'Loading...' : 'Load More'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
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

