import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ScreenWrapper from '../screen-wrapper';
import Chrevons from '@/components/Chevrons';
import styles from '@/assets/stlyes';
import colours from '@/assets/colours';

export default function HomeScreen() {
  const points = ['Control low point', 'Improve centre strike', 'Enhance clubface control'];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 750);
  };

  return (
    <ScreenWrapper>
      <GestureHandlerRootView style={styles.flexOne}>
        {refreshing && (
          <View style={styles.updateOverlay}>
            <Text style={styles.updateText}>
              Release to update
            </Text>
          </View>
        )}
        <ScrollView style={styles.scrollContainer} refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colours.yellow} />
        }>
          <View style={styles.viewContainer}>
            <Text style={[styles.subHeaderText, styles.marginBottom]}>
              Golfers seeking smarter practice & setting better on course expectations
            </Text>

            <Chrevons heading='Get the ball in the hole in the fewest shots' points={points} />
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}
