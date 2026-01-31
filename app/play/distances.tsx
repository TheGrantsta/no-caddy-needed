import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ClubDistanceList from '../../components/ClubDistanceList';
import { getClubDistancesService } from '../../service/DbService';
import styles from '../../assets/stlyes';

export default function DistancesScreen() {
    const distances = getClubDistancesService();

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Distances</Text>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        Your club carry distances
                    </Text>
                </View>
                <ClubDistanceList distances={distances} editable={false} />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
