import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { getSettingsService, saveSettingsService } from '@/service/DbService';
import Chevrons from '@/components/Chevrons';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import fontSizes from '@/assets/font-sizes';

const FOREST_GREEN = '#2D5A3D';
const OFF_WHITE = '#f5f5f0';

const points = ['In a nutshell: hit it, find it and hit it again', 'Point: get the ball in the hole with the fewest shots', 'Have fun: golf is a game, so for goodness sake enjoy it!'];

const ONBOARDING_STEPS = [
  { text: 'Welcome to No Caddy Needed — your personal golf companion for smarter play, practice and performance.' },
  { text: 'Use the Play, Practice and Perform sections to track rounds, sharpen your short game and review your stats.' },
  { text: 'Pull down to refresh at any time. Tap the info icon to see this guide again.' },
];

export default function HomeScreen() {
  const styles = useStyles();
  const colours = useThemeColours();
  const { landscapePadding } = useOrientation();
  const settings = getSettingsService();
  const [showOnboarding, setShowOnboarding] = useState(!settings.homeOnboardingSeen);
  const [refreshing, setRefreshing] = useState(false);

  const home = useMemo(() => StyleSheet.create({
    screenBg: {
      backgroundColor: OFF_WHITE,
    },
    header: {
      paddingTop: 32,
      paddingHorizontal: 24,
      paddingBottom: 4,
      alignItems: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 10,
      marginBottom: 8,
    },
    titleText: {
      color: FOREST_GREEN,
      fontSize: fontSizes.header,
      fontWeight: 'bold',
      padding: 8,
      textAlign: 'left',
    },
    subtitle: {
      color: colours.text,
      fontSize: fontSizes.normal,
      textAlign: 'left',
    },
    divider: {
      height: 1,
      backgroundColor: FOREST_GREEN,
      opacity: 0.2,
      marginHorizontal: 24,
      marginTop: 20,
      marginBottom: 4,
    },
    navGrid: {
      paddingHorizontal: 8,
      paddingTop: 16,
      gap: 12,
    },
    navRow: {
      flexDirection: 'row',
      gap: 12,
    },
    navCardLink: {
      flex: 1,
    },
    navCard: {
      backgroundColor: FOREST_GREEN,
      borderRadius: 16,
      paddingVertical: 28,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      width: '100%',
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navCardLabel: {
      color: '#ffffff',
      fontSize: fontSizes.subHeader,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    sectionHeading: {
      color: colours.primary,
      fontSize: 24,
      fontWeight: 'bold',
      padding: 6,
    },
    contentSection: {
      marginHorizontal: 8,
      marginTop: 20,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: FOREST_GREEN + '33',
    },
    bodyText: {
      color: colours.text,
      fontSize: fontSizes.normal,
      lineHeight: 24,
      marginTop: 8,
    },
  }), []);

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    const currentSettings = getSettingsService();
    await saveSettingsService({ ...currentSettings, homeOnboardingSeen: true });
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 750);
  };

  return (
    <GestureHandlerRootView style={[styles.flexOne, home.screenBg]}>
      {refreshing && (
        <View style={styles.updateOverlay}>
          <Text style={styles.updateText}>Release to update</Text>
        </View>
      )}
      <ScrollView
        style={[styles.scrollContainer, home.screenBg]}
        contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={FOREST_GREEN} />
        }
      >
        {/* Header */}
        <View style={home.header}>
          <View style={home.titleRow}>
            <TouchableOpacity testID="info-button" onPress={handleShowOnboarding}>
              <MaterialIcons name="info-outline" size={26} color={FOREST_GREEN} />
            </TouchableOpacity>
            <Text style={home.titleText}>No caddy needed!</Text>
          </View>
          <Text style={home.subtitle}>Smarter play, practice & performance</Text>
        </View>

        <View style={home.divider} />

        {/* Navigation cards — 2 + 1 grid */}
        <View style={home.navGrid}>
          <View style={home.navRow}>
            <Link testID="home-play-link" href="/play" style={home.navCardLink}>
              <View style={home.navCard}>
                <View style={home.iconCircle}>
                  <MaterialIcons name="sports-golf" size={36} color="#ffffff" />
                </View>
                <Text style={home.navCardLabel}>Play</Text>
              </View>
            </Link>
            <Link testID="home-practice-link" href="/practice" style={home.navCardLink}>
              <View style={home.navCard}>
                <View style={home.iconCircle}>
                  <MaterialIcons name="golf-course" size={36} color="#ffffff" />
                </View>
                <Text style={home.navCardLabel}>Practice</Text>
              </View>
            </Link>
          </View>
          <View style={home.navRow}>
            <Link testID="home-perform-link" href="/perform" style={home.navCardLink}>
              <View style={home.navCard}>
                <View style={home.iconCircle}>
                  <MaterialIcons name="lightbulb" size={36} color="#ffffff" />
                </View>
                <Text style={home.navCardLabel}>Perform</Text>
              </View>
            </Link>
          </View>
        </View>

        <View style={home.contentSection}>
          <Chevrons heading="Golf simplified" points={points} />
        </View>

        <View style={home.contentSection}>
          <Text style={home.sectionHeading}>Be your own best caddy</Text>
          <Text style={home.bodyText}>
            Golf is not a game of perfect, or having a perfect swing
          </Text>
        </View>
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title="No Caddy Needed"
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView>
  );
}
