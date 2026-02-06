import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import ClubDistanceList from '../../components/ClubDistanceList';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import { getClubDistancesService, saveClubDistancesService, getSettingsService, saveSettingsService } from '../../service/DbService';
import { useToast } from 'react-native-toast-notifications';
import { useStyles } from '../../hooks/useStyles';
import { useThemeColours } from '../../context/ThemeContext';
import { useOrientation } from '../../hooks/useOrientation';
import fontSizes from '@/assets/font-sizes';

const ONBOARDING_STEPS = [
    { text: 'Track your club distances to make better decisions on the course.' },
    { text: 'Add each club in your bag and enter your typical carry distance.' },
    { text: 'Use this as a quick reference when selecting clubs during your round.' },
];

export default function DistancesScreen() {
    const styles = useStyles();
    const colours = useThemeColours();
    const { landscapePadding } = useOrientation();
    const toast = useToast();
    const distances = getClubDistancesService();
    const settings = getSettingsService();
    const distancesIsEmpty = distances.length === 0;
    const [showOnboarding, setShowOnboarding] = useState(!settings.distancesOnboardingSeen && distancesIsEmpty);

    const handleDismissOnboarding = async () => {
        setShowOnboarding(false);
        const currentSettings = getSettingsService();
        await saveSettingsService({ ...currentSettings, distancesOnboardingSeen: true });
    };

    const handleShowOnboarding = () => {
        setShowOnboarding(true);
    };

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
            <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContentContainer, landscapePadding]}>
                <View style={styles.headerContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity
                            testID="info-button"
                            onPress={handleShowOnboarding}
                        >
                            <MaterialIcons name="info-outline" size={24} color={colours.yellow} />
                        </TouchableOpacity>
                        <Text style={[styles.headerText, styles.marginTop]}>Distances</Text>
                    </View>
                    <Text style={[styles.normalText, styles.marginBottom]}>Club carry distances</Text>
                </View>
                <ClubDistanceList distances={distances} onSave={handleSave} />
            </ScrollView>

            <OnboardingOverlay
                visible={showOnboarding}
                onDismiss={handleDismissOnboarding}
                title="Club Distances"
                steps={ONBOARDING_STEPS}
            />
        </GestureHandlerRootView>
    );
}
