import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import WedgeChart from '../../components/WedgeChart';
import { getWedgeChartService, saveWedgeChartService, WedgeChartData } from '../../service/DbService';
import { useToast } from 'react-native-toast-notifications';
import styles from '../../assets/stlyes';
import colours from '@/assets/colours';
import fontSizes from '@/assets/font-sizes';

export default function WedgeChartScreen() {
    const toast = useToast();
    const data = getWedgeChartService();

    const handleSave = async (chartData: WedgeChartData) => {
        const saved = await saveWedgeChartService(chartData);

        if (saved) {
            toast.show('Wedge chart saved', {
                type: 'success',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.green, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        } else {
            toast.show('Failed to save wedge chart', {
                type: 'danger',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.errorText, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        }
    };

    return (
        <GestureHandlerRootView style={styles.flexOne}>
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[styles.headerText, styles.marginTop]}>Wedge chart</Text>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        Your wedge distances
                    </Text>
                </View>
                <WedgeChart data={data} onSave={handleSave} />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
