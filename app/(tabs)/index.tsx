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
import { t } from '@/assets/i18n/i18n';

const points = [t('home.point1'), t('home.point2'), t('home.point3')];

const ONBOARDING_STEPS = [
    { text: t('home.onboardingStep1') },
    { text: t('home.onboardingStep2') },
    { text: t('home.onboardingStep3') },
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
        <View style={styles.viewContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              testID="info-button"
              onPress={handleShowOnboarding}
            >
              <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
            </TouchableOpacity>
            <Text style={[styles.headerText, styles.marginTop]}>
              {t('home.title')}
            </Text>
          </View>
          <Text style={[styles.normalText, styles.marginBottom]}>
            {t('home.subtitle')}
          </Text>

          <View style={[styles.iconsContainer, styles.marginTop]}>
            <Link testID="home-play-link" href='/play'>
              <View style={styles.iconContainer}>
                <IconButton iconName='sports-golf' label={t('home.playLabel')} size='medium' />
              </View>
            </Link>
            <Link testID="home-practice-link" href='/practice'>
              <View style={styles.iconContainer}>
                <IconButton iconName='golf-course' label={t('home.practiceLabel')} size='medium' />
              </View>
            </Link>
            <Link testID="home-perform-link" href='/perform'>
              <View style={styles.iconContainer}>
                <IconButton iconName='lightbulb' label={t('home.performLabel')} size='medium' />
              </View>
            </Link>
          </View>

          <Chevrons heading={t('home.golfSimplified')} points={points} />

          <Text style={[styles.subHeaderText, styles.marginTop]}>
            {t('home.beYourOwnCaddy')}
          </Text>

          <Text style={[styles.normalText, styles.marginTop, styles.marginBottom]}>
            {t('home.notPerfect')}
          </Text>


        </View>
      </ScrollView>

      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={handleDismissOnboarding}
        title={t('home.onboardingTitle')}
        steps={ONBOARDING_STEPS}
      />
    </GestureHandlerRootView>
  );
}
