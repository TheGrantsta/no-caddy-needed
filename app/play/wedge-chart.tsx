import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WedgeChart from '../../components/WedgeChart';
import styles from '../../assets/stlyes';

export default function WedgeChartScreen() {
    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Wedge chart</Text>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        Your wedge distances
                    </Text>
                </View>
                <WedgeChart isShowButtons={false} />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
