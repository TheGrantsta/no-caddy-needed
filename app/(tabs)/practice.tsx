import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStyles } from "@/hooks/useStyles";
import { useThemeColours } from "@/context/ThemeContext";
import { useOrientation } from "@/hooks/useOrientation";
import SubMenu from "@/components/SubMenu";
import { Link } from "expo-router";
import IconButton from "@/components/IconButton";
import { MaterialIcons } from "@expo/vector-icons";
import fontSizes from "@/assets/font-sizes";
import { getAllDrillHistoryService, getDrillStatsByTypeService, getSettingsService, saveSettingsService, DrillStats } from "@/service/DbService";
import DrillStatsChart from "@/components/DrillStatsChart";
import Chevrons from "@/components/Chevrons";
import OnboardingOverlay from "@/components/OnboardingOverlay";

const ONBOARDING_STEPS = [
  { text: 'Practice with purpose — use short game drills to sharpen your putting, chipping, pitching and bunker play.' },
  { text: 'Try the tools section for tempo training and random shot selection to keep your practice varied.' },
  { text: 'Check your history to track drill results over time and spot areas for improvement.' },
];

export default function Practice() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const settings = getSettingsService();
  const [showOnboarding, setShowOnboarding] = useState(!settings.practiceOnboardingSeen);
  const [refreshing, setRefreshing] = useState(false);
  const [section, setSection] = useState('short-game');
  const [loading, setLoading] = useState(true);
  const [drillHistoryIndex, setDrillHistoryIndex] = useState(0);
  const [drillHistory, setDrillHistory] = useState<any[]>([]);
  const [drillStats, setDrillStats] = useState<DrillStats[]>([]);
  const flatListRef = useRef(null);

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
  };

  const displaySection = (sectionName: string) => {
    return section === sectionName;
  };

  const fetchData = () => {
    try {
      const items = getAllDrillHistoryService();
      const pages = items.length > 0 ? [items.slice(0, 5), items.slice(5)] : [];
      const stats = getDrillStatsByTypeService();

      setDrillHistory(pages);
      setDrillStats(stats);
    } catch (e) {
      console.error("Error fetching drill history:", e);
    } finally {
      setLoading(false);
    }
  };

  const { width } = Dimensions.get('window');

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);

    setDrillHistoryIndex(index);
  };

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      fetchData();
      setRefreshing(false);
    }, 750);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              Make your practice time more effective
            </Text>
          </View>

          <View style={styles.divider} />
        </View>

        {/* Short game */}
        {displaySection('short-game') && (
          <View>
            <Text style={[styles.subHeaderText, styles.marginTop]}>
              Short game practice
            </Text>

            <View style={styles.navGrid}>
              <View style={styles.navRow}>
                <Link href="../short-game/putting" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="adjust" size={36} color="#ffffff" />
                    </View>
                    <Text style={styles.navCardLabel}>Putting</Text>
                  </View>
                </Link>
                <Link href="../short-game/chipping" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="filter-tilt-shift" size={36} color="#ffffff" />
                    </View>
                    <Text style={styles.navCardLabel}>Chipping</Text>
                  </View>
                </Link>
              </View>
              <View style={styles.navRow}>
                <Link href="../short-game/pitching" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="golf-course" size={36} color="#ffffff" />
                    </View>
                    <Text style={styles.navCardLabel}>Pitching</Text>
                  </View>
                </Link>
                <Link href="../short-game/bunker" style={styles.navCardLink}>
                  <View style={styles.navCard}>
                    <View style={styles.iconCircle}>
                      <MaterialIcons name="beach-access" size={36} color="#ffffff" />
                    </View>
                    <Text style={styles.navCardLabel}>Bunker play</Text>
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
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                Practice tools
              </Text>

              <View style={styles.iconsContainer}>
                <Link href='../tools/tempo'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='music-note' label='Tempo' size='medium' />
                  </View>
                </Link>

                <Link href='../tools/random'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='shuffle-on' label='Random' size='medium' />
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
                {drillStats.length > 0 && (
                  <DrillStatsChart stats={drillStats} />
                )}

                <Text style={{
                  color: colours.primary,
                  fontSize: fontSizes.subHeader,
                  alignItems: 'baseline',
                  padding: 6,
                  marginTop: 10
                }}>
                  {drillHistory.length > 0 ? "Drill History" : "No drill history yet"}
                </Text>

                <View style={styles.horizontalScrollContainer}>
                  <FlatList
                    ref={flatListRef}
                    data={drillHistory}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    renderItem={({ item }) => (
                      <View style={[styles.practiceScreen.page, styles.scrollWrapper, { margin: 10 }]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subHeaderText, { flex: 9 / 12 }]}>
                            Drill
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 1 / 12 }]}>
                            Met
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 2 / 12 }]}>
                            Date
                          </Text>
                        </View>
                        <FlatList
                          data={item}
                          keyExtractor={(_, index) => index.toString()}
                          renderItem={({ item }) => (
                            <View style={[styles.horizontalScrollContainer, { width: width - 50 }]}>
                              <View style={[{ flexDirection: 'row' }]}>

                                <Text style={[styles.cell, { textAlign: 'left', flex: 7 / 12, borderWidth: 0 }]}>
                                  {item.Name}
                                </Text>
                                <Text style={[styles.cell, { flex: 2 / 12, borderWidth: 0 }]}>
                                  <MaterialIcons
                                    name={item.Result === 1 ? 'check' : 'clear'}
                                    color={item.Result === 1 ? colours.primary : colours.errorText}
                                    size={24} />
                                </Text>
                                <Text style={[styles.cell, { flex: 3 / 12, borderWidth: 0 }]}>
                                  {item.Created_At}
                                </Text>
                              </View>
                            </View>
                          )}
                        />
                      </View>
                    )}
                  />
                </View>

                <View style={styles.scrollIndicatorContainer}>
                  {drillHistory.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.scrollIndicatorDot,
                        drillHistoryIndex === index && styles.scrollActiveDot,
                      ]}
                    />
                  ))}
                </View>
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

