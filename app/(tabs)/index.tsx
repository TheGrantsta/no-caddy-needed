import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useStyles } from '@/hooks/useStyles';
import { useThemeColours } from '@/context/ThemeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { getSettingsService, saveSettingsService } from '@/service/DbService';
import IconButton from '@/components/IconButton';
import Chevrons from '@/components/Chevrons';
import OnboardingOverlay from '@/components/OnboardingOverlay';

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
    <GestureHandlerRootView style={styles.flexOne}>
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
          tintColor={colours.yellow} />
      }>
        <View style={styles.viewContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              testID="info-button"
              onPress={handleShowOnboarding}
            >
              <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
            </TouchableOpacity>
            <Text style={[styles.headerText, styles.marginTop]}>
              No caddy needed!
            </Text>
          </View>
          <Text style={[styles.normalText, styles.marginBottom]}>
            Smarter play, practice & performance
          </Text>

          <View style={[styles.iconsContainer, styles.marginTop]}>
            <Link testID="home-play-link" href='/play'>
              <View style={styles.iconContainer}>
                <IconButton iconName='sports-golf' label='Play' size='medium' />
              </View>
            </Link>
            <Link testID="home-practice-link" href='/practice'>
              <View style={styles.iconContainer}>
                <IconButton iconName='golf-course' label='Practice' size='medium' />
              </View>
            </Link>
            <Link testID="home-perform-link" href='/perform'>
              <View style={styles.iconContainer}>
                <IconButton iconName='lightbulb' label='Perform' size='medium' />
              </View>
            </Link>
          </View>

          <Chevrons heading='Golf simplified' points={points} />

          <Text style={[styles.subHeaderText, styles.marginTop]}>
            Be your own best caddy
          </Text>

          <Text style={[styles.normalText, styles.marginTop, styles.marginBottom]}>
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
