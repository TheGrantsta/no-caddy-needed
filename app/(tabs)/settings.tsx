import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WedgeChart from '../../components/WedgeChart';
import styles from '../../assets/stlyes';
import colours from '../../assets/colours';

export default function Settings() {
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

      <ScrollView style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colours.yellow} />
        }>

        <View style={styles.headerContainer}>
          <Text style={[styles.headerText, styles.marginTop]}>
            Settings
          </Text>
        </View>

        <View style={styles.container}>
          <WedgeChart isShowButtons={true} />
        </View>

      </ScrollView>
    </GestureHandlerRootView>
  )
}
