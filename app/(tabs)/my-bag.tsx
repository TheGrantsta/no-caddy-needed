import { Animated, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SubMenu from '../../components/SubMenu';
import DistancesScreen from '../play/distances';
import WedgeChartScreen from '../play/wedge-chart';
import { useStyles } from '../../hooks/useStyles';
import { useSectionTransition } from '../../hooks/useSectionTransition';

const SECTION_ORDER = ['bag-distances', 'bag-wedge-chart'];

export default function MyBag() {
  const styles = useStyles();
  const {
    section,
    displaySection,
    handleSubMenu,
    fadeAnim,
    slideAnim,
  } = useSectionTransition(SECTION_ORDER);

  return (
    <GestureHandlerRootView style={styles.flexOne}>
      <SubMenu showSubMenu="bag" selectedItem={section} handleSubMenu={handleSubMenu} />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={[styles.headerText, styles.marginTop]}>My Bag</Text>
            </View>
          </View>
        </View>

        {displaySection('bag-distances') && (
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <DistancesScreen />
          </Animated.View>
        )}

        {displaySection('bag-wedge-chart') && (
          <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <WedgeChartScreen />
          </Animated.View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
}
