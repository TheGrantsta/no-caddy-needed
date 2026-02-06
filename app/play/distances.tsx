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
    const [showClearConfirm, setShowClearConfirm] = useState(false);

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

    const handleClear = async () => {
        const saved = await saveClubDistancesService([]);
        setShowClearConfirm(false);

        if (saved) {
            toast.show('Distances cleared', {
                type: 'success',
                textStyle: { color: colours.background, fontSize: fontSizes.normal, padding: 5, width: '100%' },
                style: { borderLeftColor: colours.green, borderLeftWidth: 10, backgroundColor: colours.yellow },
            });
        } else {
            toast.show('Failed to clear distances', {
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

                {!distancesIsEmpty && !showClearConfirm && (
                    <TouchableOpacity
                        testID="clear-button"
                        onPress={() => setShowClearConfirm(true)}
                        style={{ padding: 12, alignItems: 'center', marginTop: 20 }}
                    >
                        <Text style={{ color: colours.errorText, fontSize: fontSizes.normal }}>Clear all</Text>
                    </TouchableOpacity>
                )}

                {showClearConfirm && (
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 10 }}>
                        <TouchableOpacity
                            testID="cancel-clear-button"
                            onPress={() => setShowClearConfirm(false)}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: colours.backgroundAlternate }}
                        >
                            <Text style={{ color: colours.text, fontSize: fontSizes.normal }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="confirm-clear-button"
                            onPress={handleClear}
                            style={{ padding: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: colours.errorText }}
                        >
                            <Text style={{ color: colours.white, fontSize: fontSizes.normal }}>Confirm clear</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
