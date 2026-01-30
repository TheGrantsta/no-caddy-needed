import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Link } from 'expo-router';
import styles from '@/assets/stlyes';
import colours from '@/assets/colours';
import IconButton from '@/components/IconButton';


export default function HomeScreen() {
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
          <Text style={[styles.headerText, styles.marginTop]}>
            No caddy needed!
          </Text>
          <Text style={[styles.normalText, styles.marginBottom]}>
            Golfers seeking smarter practice & setting better on course expectations
          </Text>

          <View style={[styles.iconsContainer, styles.marginTop]}>
            <Link href='/play'>
              <View style={styles.iconContainer}>
                <IconButton iconName='sports-golf' label='Play' size='large' />
              </View>
            </Link>
            <Link href='/practice'>
              <View style={styles.iconContainer}>
                <IconButton iconName='golf-course' label='Practice' size='large' />
              </View>
            </Link>
            <Link href='/pointers'>
              <View style={styles.iconContainer}>
                <IconButton iconName='lightbulb' label='Pointers' size='large' />
              </View>
            </Link>
          </View>

          <Text style={styles.subHeaderText}>
            Be your own best caddy
          </Text>

          <Text style={[styles.normalText, styles.marginTop]}>
            Golf is not a game of perfect, or having a perfect swing
          </Text>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
