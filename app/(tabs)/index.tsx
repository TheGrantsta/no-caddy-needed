import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import ScreenWrapper from '../screen-wrapper';
import Chevrons from '@/components/Chevrons';
import styles from '@/assets/stlyes';
import colours from '@/assets/colours';
import IconButton from '@/components/IconButton';

export default function HomeScreen() {
  const points = ['Controlling low point', 'Improving centre strike', 'Enhancing clubface control'];
  const [refreshing, setRefreshing] = useState(false);

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
      <ScrollView style={styles.scrollContainer} refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colours.yellow} />
      }>
        <View style={styles.viewContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>
            No caddy needed!
          </Text>
          <Text style={[styles.normalText, styles.marginBottom]}>
            Golfers seeking smarter practice & setting better on course expectations
          </Text>

          <View style={[styles.iconsContainer, styles.marginTop]}>
            <Link href='/practice'>
              <View style={styles.iconContainer}>
                <IconButton iconName='golf-course' label='Practice' size='medium' />
              </View>
            </Link>
            <Link href='/on-course'>
              <View style={styles.iconContainer}>
                <IconButton iconName='sports-golf' label='On course' size='medium' />
              </View>
            </Link>
          </View>

          <Chevrons heading='Golf - get the ball in the hole in the fewest shots by:' points={points} />

          <Text style={[styles.normalText, styles.marginTop]}>
            Golf is not a game of perfect, or having a perfect swing
          </Text>

        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
