import type { ComponentProps } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import PageHeader from '../../components/PageHeader';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { ONBOARDING_STEPS } from '../../assets/onboardingSteps';
import { useToggle } from '../../hooks/useToggle';

const WEDGE_TILE = '#B5651D';

type BagRowProps = {
  testID: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  tileColour: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showDivider?: boolean;
};

const BagRow = ({ testID, icon, tileColour, title, subtitle, onPress, showDivider }: BagRowProps) => {
  const styles = useStyles();
  const colours = useThemeColours();
  const s = styles.myBag;

  return (
    <>
      {showDivider && <View style={s.rowDivider} />}
      <TouchableOpacity testID={testID} onPress={onPress} style={s.row} accessibilityRole="button">
        <View style={[s.iconTile, { backgroundColor: tileColour }]}>
          <MaterialIcons name={icon} size={22} color={colours.white} />
        </View>
        <View style={s.rowText}>
          <Text style={s.rowTitle}>{title}</Text>
          <Text style={s.rowSubtitle}>{subtitle}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colours.tertiary} />
      </TouchableOpacity>
    </>
  );
};

export default function MyBag() {
  const styles = useStyles();
  const colours = useThemeColours();
  const router = useRouter();
  const s = styles.myBag;
  const [showOnboarding, , setShowOnboarding] = useToggle(false);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.container}>
        <PageHeader
          title="My Bag"
          rightAction={
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show help"
              testID="bag-info-button"
              onPress={() => setShowOnboarding(true)}
              style={styles.practiceHeader.circleButton}
            >
              <MaterialIcons name="info-outline" size={22} color={colours.black} />
            </TouchableOpacity>
          }
        />

        <Text style={s.sectionLabel}>Yardages</Text>
        <View style={s.card}>
          <BagRow
            testID="bag-row-distances"
            icon="bar-chart"
            tileColour={colours.primary}
            title="Distances"
            subtitle="Carry and total for every club"
            onPress={() => router.push('/play/distances')}
          />
          <BagRow
            testID="bag-row-wedge-chart"
            icon="grid-on"
            tileColour={WEDGE_TILE}
            title="Wedge Chart"
            subtitle="Partial-swing yardages"
            onPress={() => router.push('/play/wedge-chart')}
            showDivider
          />
        </View>
      </View>
      <OnboardingOverlay
        visible={showOnboarding}
        onDismiss={() => setShowOnboarding(false)}
        title="My Bag"
        steps={ONBOARDING_STEPS.bag}
      />
    </ScrollView>
  );
}
