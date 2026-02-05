import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useToast } from 'react-native-toast-notifications';
import ClubDistanceList from '../components/ClubDistanceList';
import { getClubDistancesService, saveClubDistancesService } from '../service/DbService';
import styles from '../assets/stlyes';
import colours from '../assets/colours';
import fontSizes from '../assets/font-sizes';

export default function Settings() {
  const [refreshing, setRefreshing] = useState(false);
  const [distances, setDistances] = useState(getClubDistancesService());
  const toast = useToast();

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setDistances(getClubDistancesService());
      setRefreshing(false);
    }, 750);
  };

  const handleSaveDistances = async (data: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]) => {
    const success = await saveClubDistancesService(data);

    toast.show(success ? 'Distances saved' : 'Distances not saved', {
      type: success ? 'success' : 'danger',
      textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
      style: {
        borderLeftColor: success ? colours.green : colours.errorText,
        borderLeftWidth: 10,
        backgroundColor: colours.yellow,
      },
    });

    if (success) {
      setDistances(getClubDistancesService());
    }
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
        contentContainerStyle={styles.scrollContentContainer}
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

        <View style={styles.headerContainer}>
          <Text style={[styles.subHeaderText, styles.marginTop]}>
            Club distances
          </Text>
        </View>

        <View style={styles.container}>
          <ClubDistanceList
            distances={distances}
            onSave={handleSaveDistances}
          />
        </View>

      </ScrollView>
    </GestureHandlerRootView>
  )
}
