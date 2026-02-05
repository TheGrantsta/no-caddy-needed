import { ScrollView, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ClubDistanceList from '../../components/ClubDistanceList';
import { getClubDistancesService, saveClubDistancesService } from '../../service/DbService';
import { useToast } from 'react-native-toast-notifications';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import fontSizes from '@/assets/font-sizes';

export default function DistancesScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const toast = useToast();
    const distances = getClubDistancesService();
    const handleSave = async (distances: { Club: string; CarryDistance: number; TotalDistance: number; SortOrder: number }[]) => {
        const saved = await saveClubDistancesService(distances);

        if (saved) {
            toast.show('Clubs saved', {
                type: 'success',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.green, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        } else {
            toast.show('Failed to save clubs', {
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
                    <Text style={[styles.headerText, styles.marginTop]}>Distances</Text>
                    <Text style={[styles.normalText, styles.marginBottom]}>
                        {distances.length === 0 ? 'No clubs in your bag' : `${distances.length} clubs in your bag`}
                    </Text>
                </View>
                <ClubDistanceList distances={distances} onSave={handleSave} />
            </ScrollView>
        </GestureHandlerRootView>
    );
}
