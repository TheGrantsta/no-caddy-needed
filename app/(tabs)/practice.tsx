import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { t } from "@/assets/i18n/i18n";

const ONBOARDING_STEPS = [
    { text: t('practice.onboardingStep1') },
    { text: t('practice.onboardingStep2') },
    { text: t('practice.onboardingStep3') },
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

  const points = [t('practice.intentionPoint1'), t('practice.intentionPoint2')];

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
            {t('common.releaseToUpdate')}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colours.yellow} />
      }>

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                testID="info-button"
                onPress={handleShowOnboarding}
              >
                <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
              </TouchableOpacity>
              <Text style={[styles.headerText, styles.marginTop]}>
                {t('practice.title')}
              </Text>
            </View>
            <Text style={[styles.normalText, styles.marginBottom]}>
              {t('practice.subtitle')}
            </Text>
          </View>
        </View>

        {/* Short game */}
        {displaySection('short-game') && (
          <View>
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                {t('practice.shortGamePractice')}
              </Text>

              <View style={styles.iconsContainer}>
                <Link href='../short-game/putting'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='adjust' label={t('practice.putting')} size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/chipping'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='filter-tilt-shift' label={t('practice.chipping')} size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/pitching'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='golf-course' label={t('practice.pitching')} size='medium' />
                  </View>
                </Link>

                <Link href='../short-game/bunker'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='beach-access' label={t('practice.bunkerPlay')} size='medium' />
                  </View>
                </Link>
              </View>
            </View>

            <Chevrons heading={t('practice.intentionHeading')} points={points} />
          </View>
        )}

        {/* Tools */}
        {displaySection('tools') && (
          <View>
            <View style={styles.viewContainer}>
              <Text style={[styles.subHeaderText, styles.marginTop]}>
                {t('practice.practiceTools')}
              </Text>

              <View style={styles.iconsContainer}>
                <Link href='../tools/tempo'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='music-note' label={t('practice.tempo')} size='medium' />
                  </View>
                </Link>

                <Link href='../tools/random'>
                  <View style={styles.iconContainer}>
                    <IconButton iconName='shuffle-on' label={t('practice.random')} size='medium' />
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
                <ActivityIndicator size="large" color={colours.yellow} />
              </View>
            ) : (
              <View>
                {drillStats.length > 0 && (
                  <DrillStatsChart stats={drillStats} />
                )}

                <Text style={{
                  color: colours.yellow,
                  fontSize: fontSizes.subHeader,
                  alignItems: 'baseline',
                  padding: 6,
                  marginTop: 10
                }}>
                  {drillHistory.length > 0 ? t('practice.drillHistory') : t('practice.noDrillHistory')}
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
                      <View style={[localStyles.page, styles.scrollWrapper, { margin: 10 }]}>
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={[styles.subHeaderText, { flex: 9 / 12 }]}>
                            {t('practice.drillHeader')}
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 1 / 12 }]}>
                            {t('practice.metHeader')}
                          </Text>
                          <Text style={[styles.subHeaderText, { flex: 2 / 12 }]}>
                            {t('practice.dateHeader')}
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
                                    color={item.Result === 1 ? colours.yellow : colours.errorText}
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
        title={t('practice.onboardingTitle')}
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView >
  )
};

const localStyles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    width: 100,
    height: 100,
    backgroundColor: "#4A90E2",
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
